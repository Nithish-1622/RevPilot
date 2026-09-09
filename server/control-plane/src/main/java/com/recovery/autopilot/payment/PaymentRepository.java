package com.recovery.autopilot.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByMerchantId(String merchantId);
    List<Payment> findByStatus(PaymentStatus status);
    long countByCustomerId(String customerId);
    long countByCustomerIdAndStatus(String customerId, PaymentStatus status);
}
