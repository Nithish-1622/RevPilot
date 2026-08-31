package com.recovery.autopilot;

import com.recovery.autopilot.audit.AuditEventRepository;
import com.recovery.autopilot.customer.Customer;
import com.recovery.autopilot.customer.CustomerRepository;
import com.recovery.autopilot.event.EventOutboxRepository;
import com.recovery.autopilot.infrastructure.ai.AiServiceClient;
import com.recovery.autopilot.merchant.Merchant;
import com.recovery.autopilot.merchant.MerchantRepository;
import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentRepository;
import com.recovery.autopilot.payment.PaymentStateMachine;
import com.recovery.autopilot.payment.PaymentStatus;
import com.recovery.autopilot.policy.PolicyEngine;
import com.recovery.autopilot.policy.RecoveryPolicy;
import com.recovery.autopilot.policy.RecoveryPolicyRepository;
import com.recovery.autopilot.razorpay.RazorpayClientService;
import com.recovery.autopilot.recovery.FallbackRecoveryService;
import com.recovery.autopilot.recovery.RecoveryCase;
import com.recovery.autopilot.recovery.RecoveryCaseRepository;
import com.recovery.autopilot.recovery.RecoveryCaseStatus;
import com.recovery.autopilot.recovery.RecoveryService;
import com.recovery.autopilot.audit.AuditService;
import com.recovery.autopilot.event.OutboxService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class EndToEndRecoveryIntegrationTest {

    private RecoveryCaseRepository recoveryCaseRepository;
    private PaymentRepository paymentRepository;
    private CustomerRepository customerRepository;
    private MerchantRepository merchantRepository;
    private RecoveryPolicyRepository recoveryPolicyRepository;
    private AuditEventRepository auditEventRepository;
    private EventOutboxRepository eventOutboxRepository;

    private PaymentStateMachine paymentStateMachine;
    private AiServiceClient aiServiceClient;
    private FallbackRecoveryService fallbackRecoveryService;
    private PolicyEngine policyEngine;
    private RazorpayClientService razorpayClientService;
    private AuditService auditService;
    private OutboxService outboxService;
    private RecoveryService recoveryService;

    @BeforeEach
    public void setUp() {
        recoveryCaseRepository = Mockito.mock(RecoveryCaseRepository.class);
        paymentRepository = Mockito.mock(PaymentRepository.class);
        customerRepository = Mockito.mock(CustomerRepository.class);
        merchantRepository = Mockito.mock(MerchantRepository.class);
        recoveryPolicyRepository = Mockito.mock(RecoveryPolicyRepository.class);
        auditEventRepository = Mockito.mock(AuditEventRepository.class);
        eventOutboxRepository = Mockito.mock(EventOutboxRepository.class);

        paymentStateMachine = new PaymentStateMachine();
        aiServiceClient = new AiServiceClient();
        fallbackRecoveryService = new FallbackRecoveryService();
        policyEngine = new PolicyEngine();
        razorpayClientService = new RazorpayClientService() {
            @Override
            public RazorpayExecutionResult executeRecoveryPayment(String paymentId, BigDecimal amount, String actionType, String failureCode) {
                return new RazorpayExecutionResult(true, "pay_test_123", "order_test_123", "Razorpay payment capture successful.");
            }
        };

        auditService = new AuditService(auditEventRepository);
        outboxService = new OutboxService(eventOutboxRepository);

        recoveryService = new RecoveryService(
            recoveryCaseRepository,
            paymentRepository,
            customerRepository,
            merchantRepository,
            recoveryPolicyRepository,
            paymentStateMachine,
            aiServiceClient,
            fallbackRecoveryService,
            policyEngine,
            razorpayClientService,
            auditService,
            outboxService
        );
    }

    @Test
    public void testEndToEndRecoveryFlowLowValueCompliant() {
        String caseId = "REC-pay-100";
        String payId = "pay-100";
        String custId = "cust-100";
        String merchId = "merch-100";
        BigDecimal amount = new BigDecimal("1200.00");

        Payment payment = new Payment(payId, merchId, custId, amount, "INR", PaymentStatus.RECOVERY_ELIGIBLE, "credit_card");
        RecoveryCase recoveryCase = new RecoveryCase(caseId, payId, custId, merchId, amount, RecoveryCaseStatus.RECOVERY_ELIGIBLE);

        when(recoveryCaseRepository.findById(caseId)).thenReturn(Optional.of(recoveryCase));
        when(paymentRepository.findById(payId)).thenReturn(Optional.of(payment));
        when(recoveryCaseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Execute recovery workflow
        RecoveryCase result = recoveryService.executeRecovery(caseId, "TRANSIENT_FAILURE");

        // Verify final state is RECOVERED
        assertEquals(RecoveryCaseStatus.RECOVERED, result.getStatus());
        assertEquals(PaymentStatus.RECOVERED, payment.getStatus());
        assertNotNull(payment.getRazorpayPaymentId());
    }

    @Test
    public void testEndToEndRecoveryFlowHighValueHumanApprovalGating() {
        String caseId = "REC-pay-200";
        String payId = "pay-200";
        String custId = "cust-200";
        String merchId = "merch-200";
        BigDecimal amount = new BigDecimal("15000.00"); // exceeds 5,000 threshold

        Payment payment = new Payment(payId, merchId, custId, amount, "INR", PaymentStatus.RECOVERY_ELIGIBLE, "credit_card");
        RecoveryCase recoveryCase = new RecoveryCase(caseId, payId, custId, merchId, amount, RecoveryCaseStatus.RECOVERY_ELIGIBLE);

        when(recoveryCaseRepository.findById(caseId)).thenReturn(Optional.of(recoveryCase));
        when(paymentRepository.findById(payId)).thenReturn(Optional.of(payment));
        when(recoveryCaseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. Initial execution attempt should place case into PENDING_APPROVAL
        RecoveryCase pendingResult = recoveryService.executeRecovery(caseId, "TRANSIENT_FAILURE");
        assertEquals(RecoveryCaseStatus.PENDING_APPROVAL, pendingResult.getStatus());

        // 2. Explicit human approval should transition case to RECOVERED
        RecoveryCase approvedResult = recoveryService.approveCase(caseId);
        assertEquals(RecoveryCaseStatus.RECOVERED, approvedResult.getStatus());
        assertEquals(PaymentStatus.RECOVERED, payment.getStatus());
    }
}
