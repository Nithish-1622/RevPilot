package com.recovery.autopilot;

import com.recovery.autopilot.policy.PolicyController;
import com.recovery.autopilot.policy.RecoveryPolicy;
import com.recovery.autopilot.policy.RecoveryPolicyRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class CacheVerificationTest {

    @Test
    public void testPolicyCacheAndEvictionOnUpdate() {
        RecoveryPolicyRepository repository = Mockito.mock(RecoveryPolicyRepository.class);
        PolicyController controller = new PolicyController(repository);

        String merchantId = "merch_cache_101";
        RecoveryPolicy originalPolicy = new RecoveryPolicy(UUID.randomUUID().toString(), merchantId, 2, new BigDecimal("15.00"), new BigDecimal("5000.00"), 2, new BigDecimal("0.4000"), 120);

        when(repository.findByMerchantId(merchantId)).thenReturn(Optional.of(originalPolicy));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. Initial Get
        ResponseEntity<RecoveryPolicy> res1 = controller.getPolicy(merchantId);
        assertEquals(new BigDecimal("15.00"), res1.getBody().getMaxDiscountPercent());

        // 2. Update Policy (Triggers @CacheEvict and returns updated entity)
        RecoveryPolicy updatedPolicy = new RecoveryPolicy(originalPolicy.getId(), merchantId, 3, new BigDecimal("25.00"), new BigDecimal("10000.00"), 3, new BigDecimal("0.5000"), 180);
        when(repository.findByMerchantId(merchantId)).thenReturn(Optional.of(updatedPolicy));

        ResponseEntity<RecoveryPolicy> updateRes = controller.updatePolicy(merchantId, updatedPolicy);
        assertEquals(new BigDecimal("25.00"), updateRes.getBody().getMaxDiscountPercent());

        // 3. Second Get after eviction returns fresh updated policy
        ResponseEntity<RecoveryPolicy> res2 = controller.getPolicy(merchantId);
        assertEquals(new BigDecimal("25.00"), res2.getBody().getMaxDiscountPercent());
    }
}
