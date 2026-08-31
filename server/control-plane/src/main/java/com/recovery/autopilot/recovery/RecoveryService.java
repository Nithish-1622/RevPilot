package com.recovery.autopilot.recovery;

import com.recovery.autopilot.audit.AuditService;
import com.recovery.autopilot.customer.Customer;
import com.recovery.autopilot.customer.CustomerRepository;
import com.recovery.autopilot.event.OutboxService;
import com.recovery.autopilot.infrastructure.ai.AiServiceClient;
import com.recovery.autopilot.infrastructure.ai.AiServiceClient.AiAnalysisResult;
import com.recovery.autopilot.merchant.Merchant;
import com.recovery.autopilot.merchant.MerchantRepository;
import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentRepository;
import com.recovery.autopilot.payment.PaymentStateMachine;
import com.recovery.autopilot.payment.PaymentStatus;
import com.recovery.autopilot.policy.PolicyEngine;
import com.recovery.autopilot.policy.PolicyEngine.PolicyEvaluationResult;
import com.recovery.autopilot.policy.RecoveryPolicy;
import com.recovery.autopilot.policy.RecoveryPolicyRepository;
import com.recovery.autopilot.razorpay.RazorpayClientService;
import com.recovery.autopilot.razorpay.RazorpayClientService.RazorpayExecutionResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class RecoveryService {

    private final RecoveryCaseRepository recoveryCaseRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final MerchantRepository merchantRepository;
    private final RecoveryPolicyRepository recoveryPolicyRepository;
    private final PaymentStateMachine paymentStateMachine;
    private final AiServiceClient aiServiceClient;
    private final FallbackRecoveryService fallbackRecoveryService;
    private final PolicyEngine policyEngine;
    private final RazorpayClientService razorpayClientService;
    private final AuditService auditService;
    private final OutboxService outboxService;

    public RecoveryService(
        RecoveryCaseRepository recoveryCaseRepository,
        PaymentRepository paymentRepository,
        CustomerRepository customerRepository,
        MerchantRepository merchantRepository,
        RecoveryPolicyRepository recoveryPolicyRepository,
        PaymentStateMachine paymentStateMachine,
        AiServiceClient aiServiceClient,
        FallbackRecoveryService fallbackRecoveryService,
        PolicyEngine policyEngine,
        RazorpayClientService razorpayClientService,
        AuditService auditService,
        OutboxService outboxService
    ) {
        this.recoveryCaseRepository = recoveryCaseRepository;
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
        this.merchantRepository = merchantRepository;
        this.recoveryPolicyRepository = recoveryPolicyRepository;
        this.paymentStateMachine = paymentStateMachine;
        this.aiServiceClient = aiServiceClient;
        this.fallbackRecoveryService = fallbackRecoveryService;
        this.policyEngine = policyEngine;
        this.razorpayClientService = razorpayClientService;
        this.auditService = auditService;
        this.outboxService = outboxService;
    }

    @Transactional
    public RecoveryCase analyzeCase(String caseId, String failureCode) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("Recovery case not found: " + caseId));
        
        Payment payment = paymentRepository.findById(recoveryCase.getPaymentId())
            .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        Customer customer = customerRepository.findById(recoveryCase.getCustomerId()).orElse(null);
        String correlationId = UUID.randomUUID().toString();

        auditService.logEvent(caseId, payment.getId(), "SYSTEM", "RULE_ENGINE", "AI_ANALYSIS_STARTED", null, "Initiating recovery analysis", null, null, correlationId);

        // Build Payload for AI Service
        Map<String, Object> reqPayload = new HashMap<>();
        reqPayload.put("payment_id", payment.getId());
        reqPayload.put("customer_id", payment.getCustomerId());
        reqPayload.put("merchant_id", payment.getMerchantId());
        reqPayload.put("amount", payment.getAmount().doubleValue());
        reqPayload.put("currency", payment.getCurrency());
        reqPayload.put("payment_method", payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "credit_card");
        reqPayload.put("failure_code", failureCode != null ? failureCode : "TRANSIENT_FAILURE");
        reqPayload.put("attempt_number", recoveryCase.getAttemptCount() + 1);
        reqPayload.put("prev_successful_payments", customer != null ? 10 : 2);
        reqPayload.put("prev_failed_payments", customer != null ? 1 : 0);
        reqPayload.put("customer_ltv", customer != null ? customer.getLtv().doubleValue() : 5000.0);
        reqPayload.put("customer_tenure_months", customer != null ? customer.getTenureMonths() : 6);
        reqPayload.put("subscription_age_days", 90);
        reqPayload.put("days_since_prev_payment", 15);
        reqPayload.put("hour_of_day", 14);
        reqPayload.put("day_of_week", 2);
        reqPayload.put("customer_segment", customer != null ? customer.getSegment() : "STANDARD");

        // Call FastAPI or fallback
        Optional<AiAnalysisResult> aiOpt = aiServiceClient.analyzeRecovery(reqPayload);
        AiAnalysisResult aiRes = aiOpt.orElseGet(() -> 
            fallbackRecoveryService.computeFallbackAnalysis(payment.getId(), payment.getAmount(), failureCode, recoveryCase.getAttemptCount())
        );

        // Update RecoveryCase with predictions
        recoveryCase.setRiskScore(aiRes.getRiskScore());
        recoveryCase.setRecoveryProbability(aiRes.getRecoveryProbability());
        recoveryCase.setExpectedRecoveryValue(aiRes.getExpectedRecoveryValue());
        recoveryCase.setRecommendedAction(aiRes.getRecommendedAction());

        auditService.logEvent(caseId, payment.getId(), "FASTAPI_AI", "AI", "AI_ANALYSIS_COMPLETED", aiRes.getRecommendedAction(), aiRes.getExplanation(), "PROPOSED", null, correlationId);

        // Fetch Policy
        RecoveryPolicy policy = recoveryPolicyRepository.findByMerchantId(recoveryCase.getMerchantId())
            .orElseGet(() -> new RecoveryPolicy(UUID.randomUUID().toString(), recoveryCase.getMerchantId(), 2, new BigDecimal("15.00"), new BigDecimal("5000.00"), 2, new BigDecimal("0.4000"), 120));

        // Evaluate Policy
        PolicyEvaluationResult policyRes = policyEngine.evaluate(recoveryCase, policy, aiRes.getRecommendedAction(), BigDecimal.ZERO);

        if (!policyRes.isAllowed()) {
            recoveryCase.setStatus(RecoveryCaseStatus.BLOCKED);
            paymentStateMachine.transition(payment, PaymentStatus.BLOCKED);
            auditService.logEvent(caseId, payment.getId(), "SPRING_POLICY_ENGINE", "RULE_ENGINE", "RECOVERY_ACTION_BLOCKED", aiRes.getRecommendedAction(), policyRes.getReason(), "BLOCKED", "BLOCK", correlationId);
            outboxService.publishEvent("RECOVERY_CASE", caseId, "recovery.action.blocked.v1", Map.of("caseId", caseId, "reason", policyRes.getReason()));
        } else if (policyRes.isRequiresApproval()) {
            recoveryCase.setStatus(RecoveryCaseStatus.PENDING_APPROVAL);
            auditService.logEvent(caseId, payment.getId(), "SPRING_POLICY_ENGINE", "RULE_ENGINE", "HUMAN_APPROVAL_REQUIRED", aiRes.getRecommendedAction(), policyRes.getReason(), "PENDING_APPROVAL", "ALLOW", correlationId);
            outboxService.publishEvent("RECOVERY_CASE", caseId, "recovery.action.pending_approval.v1", Map.of("caseId", caseId, "reason", policyRes.getReason()));
        } else {
            auditService.logEvent(caseId, payment.getId(), "SPRING_POLICY_ENGINE", "RULE_ENGINE", "POLICY_CHECKED", aiRes.getRecommendedAction(), policyRes.getReason(), "ALLOWED", "ALLOW", correlationId);
        }

        recoveryCaseRepository.save(recoveryCase);
        paymentRepository.save(payment);
        return recoveryCase;
    }

    @Transactional
    public RecoveryCase executeRecovery(String caseId, String failureCode) {
        RecoveryCase recoveryCase = analyzeCase(caseId, failureCode);
        
        if (recoveryCase.getStatus() == RecoveryCaseStatus.BLOCKED || recoveryCase.getStatus() == RecoveryCaseStatus.PENDING_APPROVAL) {
            return recoveryCase;
        }

        return forceExecuteRecovery(recoveryCase, failureCode);
    }

    @Transactional
    public RecoveryCase approveCase(String caseId) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("Recovery case not found: " + caseId));
        
        String correlationId = UUID.randomUUID().toString();
        auditService.logEvent(caseId, recoveryCase.getPaymentId(), "MERCHANT_USER", "HUMAN", "ACTION_APPROVED", recoveryCase.getRecommendedAction(), "Human merchant approved high-value transaction recovery", "APPROVED", "ALLOW", correlationId);
        outboxService.publishEvent("RECOVERY_CASE", caseId, "recovery.action.approved.v1", Map.of("caseId", caseId));
        
        recoveryCase.setStatus(RecoveryCaseStatus.RECOVERY_ELIGIBLE);
        return forceExecuteRecovery(recoveryCase, "TRANSIENT_FAILURE");
    }

    @Transactional
    public RecoveryCase rejectCase(String caseId) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("Recovery case not found: " + caseId));
        
        Payment payment = paymentRepository.findById(recoveryCase.getPaymentId())
            .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        recoveryCase.setStatus(RecoveryCaseStatus.BLOCKED);
        paymentStateMachine.transition(payment, PaymentStatus.BLOCKED);

        String correlationId = UUID.randomUUID().toString();
        auditService.logEvent(caseId, payment.getId(), "MERCHANT_USER", "HUMAN", "ACTION_REJECTED", recoveryCase.getRecommendedAction(), "Human merchant rejected recovery intervention", "REJECTED", "BLOCK", correlationId);
        outboxService.publishEvent("RECOVERY_CASE", caseId, "recovery.action.blocked.v1", Map.of("caseId", caseId, "reason", "Human merchant rejected intervention"));

        paymentRepository.save(payment);
        return recoveryCaseRepository.save(recoveryCase);
    }

    private RecoveryCase forceExecuteRecovery(RecoveryCase recoveryCase, String failureCode) {
        Payment payment = paymentRepository.findById(recoveryCase.getPaymentId())
            .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        String correlationId = UUID.randomUUID().toString();
        paymentStateMachine.transition(payment, PaymentStatus.RECOVERY_IN_PROGRESS);
        recoveryCase.setStatus(RecoveryCaseStatus.RECOVERY_IN_PROGRESS);
        recoveryCase.setAttemptCount(recoveryCase.getAttemptCount() + 1);

        auditService.logEvent(recoveryCase.getId(), payment.getId(), "FINANCIAL_CONTROL_PLANE", "SYSTEM", "RAZORPAY_REQUESTED", recoveryCase.getRecommendedAction(), "Executing Razorpay recovery transaction", "EXECUTING", "ALLOW", correlationId);

        // Execute via Razorpay Client Service
        RazorpayExecutionResult razorpayResult = razorpayClientService.executeRecoveryPayment(
            payment.getId(), payment.getAmount(), recoveryCase.getRecommendedAction(), failureCode
        );

        if (razorpayResult.isSuccess()) {
            paymentStateMachine.transition(payment, PaymentStatus.RECOVERED);
            recoveryCase.setStatus(RecoveryCaseStatus.RECOVERED);
            payment.setRazorpayPaymentId(razorpayResult.getRazorpayPaymentId());
            payment.setRazorpayOrderId(razorpayResult.getRazorpayOrderId());

            auditService.logEvent(recoveryCase.getId(), payment.getId(), "RAZORPAY_GATEWAY", "SYSTEM", "PAYMENT_RECOVERED", recoveryCase.getRecommendedAction(), razorpayResult.getMessage(), "SUCCESS", "ALLOW", correlationId);
            outboxService.publishEvent("PAYMENT", payment.getId(), "payment.recovered.v1", Map.of("paymentId", payment.getId(), "amount", payment.getAmount()));
        } else {
            if (recoveryCase.getAttemptCount() >= recoveryCase.getMaxAttempts()) {
                paymentStateMachine.transition(payment, PaymentStatus.EXHAUSTED);
                recoveryCase.setStatus(RecoveryCaseStatus.EXHAUSTED);
            } else {
                paymentStateMachine.transition(payment, PaymentStatus.FAILED);
                recoveryCase.setStatus(RecoveryCaseStatus.RECOVERY_ELIGIBLE);
            }
            auditService.logEvent(recoveryCase.getId(), payment.getId(), "RAZORPAY_GATEWAY", "SYSTEM", "RECOVERY_FAILED", recoveryCase.getRecommendedAction(), razorpayResult.getMessage(), "FAILED", "ALLOW", correlationId);
            outboxService.publishEvent("PAYMENT", payment.getId(), "recovery.failed.v1", Map.of("paymentId", payment.getId(), "attempt", recoveryCase.getAttemptCount()));
        }

        paymentRepository.save(payment);
        return recoveryCaseRepository.save(recoveryCase);
    }
}
