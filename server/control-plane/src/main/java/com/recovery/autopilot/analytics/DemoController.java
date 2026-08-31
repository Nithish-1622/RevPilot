package com.recovery.autopilot.analytics;

import com.recovery.autopilot.customer.Customer;
import com.recovery.autopilot.customer.CustomerRepository;
import com.recovery.autopilot.merchant.Merchant;
import com.recovery.autopilot.merchant.MerchantRepository;
import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentRepository;
import com.recovery.autopilot.payment.PaymentStatus;
import com.recovery.autopilot.policy.RecoveryPolicy;
import com.recovery.autopilot.policy.RecoveryPolicyRepository;
import com.recovery.autopilot.recovery.RecoveryCase;
import com.recovery.autopilot.recovery.RecoveryCaseRepository;
import com.recovery.autopilot.recovery.RecoveryCaseStatus;
import com.recovery.autopilot.recovery.RecoveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/demo")
@CrossOrigin(origins = "*")
public class DemoController {

    private final MerchantRepository merchantRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;
    private final RecoveryCaseRepository recoveryCaseRepository;
    private final RecoveryPolicyRepository recoveryPolicyRepository;
    private final RecoveryService recoveryService;

    public DemoController(
        MerchantRepository merchantRepository,
        CustomerRepository customerRepository,
        PaymentRepository paymentRepository,
        RecoveryCaseRepository recoveryCaseRepository,
        RecoveryPolicyRepository recoveryPolicyRepository,
        RecoveryService recoveryService
    ) {
        this.merchantRepository = merchantRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
        this.recoveryCaseRepository = recoveryCaseRepository;
        this.recoveryPolicyRepository = recoveryPolicyRepository;
        this.recoveryService = recoveryService;
    }

    @PostMapping("/generate-batch")
    public ResponseEntity<Map<String, Object>> generateBatch(@RequestParam(defaultValue = "10") int count) {
        String merchantId = "merch_demo_101";
        if (!merchantRepository.existsById(merchantId)) {
            merchantRepository.save(new Merchant(merchantId, "Fintech Merchant Inc", "support@fintech.com", "hash123"));
            recoveryPolicyRepository.save(new RecoveryPolicy(UUID.randomUUID().toString(), merchantId, 2, new BigDecimal("15.00"), new BigDecimal("5000.00"), 2, new BigDecimal("0.4000"), 120));
        }

        List<String> createdCaseIds = new ArrayList<>();
        String[] failureTypes = {"TRANSIENT_FAILURE", "INSUFFICIENT_FUNDS", "EXPIRED_CARD", "FRAUD_SUSPECTED"};

        for (int i = 0; i < count; i++) {
            String custId = "cust_" + UUID.randomUUID().toString().substring(0, 8);
            customerRepository.save(new Customer(custId, merchantId, "cust" + i + "@example.com", "Customer " + i, new BigDecimal("8500.00"), 12, "STANDARD"));

            String payId = "pay_" + UUID.randomUUID().toString().substring(0, 8);
            BigDecimal amount = new BigDecimal(800 + (i * 1200));
            paymentRepository.save(new Payment(payId, merchantId, custId, amount, "INR", PaymentStatus.RECOVERY_ELIGIBLE, "credit_card"));

            String caseId = "REC-" + payId;
            RecoveryCase rc = new RecoveryCase(caseId, payId, custId, merchantId, amount, RecoveryCaseStatus.RECOVERY_ELIGIBLE);
            recoveryCaseRepository.save(rc);
            createdCaseIds.add(caseId);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("generatedCount", count);
        res.put("caseIds", createdCaseIds);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/run-recovery")
    public ResponseEntity<Map<String, Object>> runRecovery() {
        long startTime = System.currentTimeMillis();
        List<RecoveryCase> eligibleCases = recoveryCaseRepository.findByStatus(RecoveryCaseStatus.RECOVERY_ELIGIBLE);
        int processed = 0;
        int recovered = 0;
        int blocked = 0;
        int pendingApproval = 0;

        String[] codes = {"TRANSIENT_FAILURE", "INSUFFICIENT_FUNDS", "EXPIRED_CARD", "FRAUD_SUSPECTED"};

        for (int i = 0; i < eligibleCases.size(); i++) {
            RecoveryCase rc = eligibleCases.get(i);
            String failureCode = codes[i % codes.length];

            try {
                RecoveryCase updated = recoveryService.executeRecovery(rc.getId(), failureCode);
                processed++;

                if (updated.getStatus() == RecoveryCaseStatus.RECOVERED) recovered++;
                if (updated.getStatus() == RecoveryCaseStatus.BLOCKED) blocked++;
                if (updated.getStatus() == RecoveryCaseStatus.PENDING_APPROVAL) pendingApproval++;
            } catch (Exception e) {
                System.err.println("Warning: Error processing case " + rc.getId() + ": " + e.getMessage());
            }
        }

        long durationMs = System.currentTimeMillis() - startTime;

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("processedCount", processed);
        res.put("recoveredCount", recovered);
        res.put("blockedCount", blocked);
        res.put("pendingApprovalCount", pendingApproval);
        res.put("executionTimeMs", durationMs);
        return ResponseEntity.ok(res);
    }
}
