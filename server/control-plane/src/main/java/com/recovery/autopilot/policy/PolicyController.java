package com.recovery.autopilot.policy;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/policy")
@CrossOrigin(origins = "*")
public class PolicyController {

    private final RecoveryPolicyRepository recoveryPolicyRepository;

    public PolicyController(RecoveryPolicyRepository recoveryPolicyRepository) {
        this.recoveryPolicyRepository = recoveryPolicyRepository;
    }

    @GetMapping("/{merchantId}")
    public ResponseEntity<RecoveryPolicy> getPolicy(@PathVariable String merchantId) {
        return ResponseEntity.ok(getOrSavePolicy(merchantId));
    }

    @Cacheable(value = "recovery_policies", key = "#merchantId")
    public RecoveryPolicy getOrSavePolicy(String merchantId) {
        return recoveryPolicyRepository.findByMerchantId(merchantId)
            .orElseGet(() -> recoveryPolicyRepository.save(new RecoveryPolicy(
                UUID.randomUUID().toString(),
                merchantId,
                2,
                new java.math.BigDecimal("15.00"),
                new java.math.BigDecimal("5000.00"),
                2,
                new java.math.BigDecimal("0.4000"),
                120
            )));
    }

    @PostMapping("/{merchantId}")
    @CacheEvict(value = "recovery_policies", key = "#merchantId")
    public ResponseEntity<RecoveryPolicy> updatePolicy(@PathVariable String merchantId, @RequestBody RecoveryPolicy updatedPolicy) {
        RecoveryPolicy existing = recoveryPolicyRepository.findByMerchantId(merchantId)
            .orElseGet(() -> {
                updatedPolicy.setId(UUID.randomUUID().toString());
                updatedPolicy.setMerchantId(merchantId);
                return updatedPolicy;
            });

        existing.setMaxRetryAttempts(updatedPolicy.getMaxRetryAttempts());
        existing.setMaxDiscountPercent(updatedPolicy.getMaxDiscountPercent());
        existing.setApprovalThreshold(updatedPolicy.getApprovalThreshold());
        existing.setMaxCustomerContacts(updatedPolicy.getMaxCustomerContacts());
        existing.setMinimumRecoveryProbability(updatedPolicy.getMinimumRecoveryProbability());
        existing.setCooldownMinutes(updatedPolicy.getCooldownMinutes());

        return ResponseEntity.ok(recoveryPolicyRepository.save(existing));
    }
}
