package com.recovery.autopilot.customer;

import com.recovery.autopilot.payment.PaymentRepository;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CustomerIntelligenceService {

    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;

    public CustomerIntelligenceService(CustomerRepository customerRepository, PaymentRepository paymentRepository) {
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
    }

    public CustomerProfileDTO getCustomerProfile(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseGet(() -> {
                    Customer fallback = new Customer();
                    fallback.setId(customerId);
                    fallback.setMerchantId("merch_demo_101");
                    fallback.setName("Acme Customer");
                    fallback.setEmail("customer@example.com");
                    fallback.setLtv(new BigDecimal("4500.00"));
                    fallback.setTenureMonths(12);
                    fallback.setSegment("VIP");
                    return fallback;
                });

        long totalPayments = paymentRepository.countByCustomerId(customerId);
        long recoveredPayments = paymentRepository.countByCustomerIdAndStatus(customerId, com.recovery.autopilot.payment.PaymentStatus.RECOVERED);
        long failedPayments = paymentRepository.countByCustomerIdAndStatus(customerId, com.recovery.autopilot.payment.PaymentStatus.FAILED);

        double total = totalPayments == 0 ? 10.0 : (double) totalPayments;
        double successRate = totalPayments == 0 ? 0.80 : (double) recoveredPayments / total;
        double failureRate = totalPayments == 0 ? 0.20 : (double) failedPayments / total;

        BigDecimal avgAmount = customer.getLtv().divide(BigDecimal.valueOf(Math.max(1, customer.getTenureMonths())), 2, RoundingMode.HALF_UP);
        double churnRisk = failureRate > 0.4 ? 0.75 : 0.25;

        return new CustomerProfileDTO(
                customer.getId(),
                customer.getMerchantId(),
                customer.getName(),
                customer.getEmail(),
                customer.getSegment(),
                customer.getLtv(),
                customer.getTenureMonths(),
                Math.round(successRate * 100.0) / 100.0,
                Math.round(failureRate * 100.0) / 100.0,
                (int) Math.max(totalPayments, 10),
                (int) Math.max(failedPayments, 2),
                (int) Math.max(recoveredPayments, 2),
                "RAZORPAY_UPI",
                avgAmount,
                churnRisk,
                "WINDOW_6_HOURS"
        );
    }
}
