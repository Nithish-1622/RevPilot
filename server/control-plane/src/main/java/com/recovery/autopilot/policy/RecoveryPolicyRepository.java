package com.recovery.autopilot.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecoveryPolicyRepository extends JpaRepository<RecoveryPolicy, String> {
    Optional<RecoveryPolicy> findByMerchantId(String merchantId);
}
