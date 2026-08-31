package com.recovery.autopilot.recovery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RecoveryCaseRepository extends JpaRepository<RecoveryCase, String> {
    List<RecoveryCase> findByMerchantId(String merchantId);
    List<RecoveryCase> findByStatus(RecoveryCaseStatus status);

    @Query("SELECT SUM(c.amount) FROM RecoveryCase c WHERE c.status = 'RECOVERY_ELIGIBLE' OR c.status = 'RECOVERY_IN_PROGRESS'")
    BigDecimal calculateRevenueAtRisk();

    @Query("SELECT SUM(c.amount) FROM RecoveryCase c WHERE c.status = 'RECOVERED'")
    BigDecimal calculateRecoveredRevenue();
}
