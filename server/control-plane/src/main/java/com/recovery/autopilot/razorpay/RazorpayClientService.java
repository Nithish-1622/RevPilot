package com.recovery.autopilot.razorpay;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
public class RazorpayClientService {

    @Value("${razorpay.key-id:rzp_test_dummy_key_id}")
    private String keyId;

    @Value("${razorpay.key-secret:rzp_test_dummy_key_secret}")
    private String keySecret;

    public RazorpayExecutionResult executeRecoveryPayment(String paymentId, BigDecimal amount, String actionType, String failureCode) {
        // Razorpay Test Mode / Controlled Simulator Logic
        String razorpayPaymentId = "pay_test_" + UUID.randomUUID().toString().substring(0, 8);
        String razorpayOrderId = "order_test_" + UUID.randomUUID().toString().substring(0, 8);

        boolean success = false;
        String message;

        if ("RETRY_NOW".equals(actionType) || "RETRY_LATER".equals(actionType)) {
            if ("TRANSIENT_FAILURE".equals(failureCode)) {
                success = Math.random() < 0.85; // 85% success for transient failures
            } else if ("INSUFFICIENT_FUNDS".equals(failureCode)) {
                success = Math.random() < 0.40; // 40% success for delayed retry
            } else {
                success = Math.random() < 0.20;
            }
            message = success ? "Razorpay payment capture successful." : "Razorpay payment attempt declined by issuing bank.";
        } else if ("OFFER_INCENTIVE".equals(actionType) || "REQUEST_PAYMENT_UPDATE".equals(actionType)) {
            success = Math.random() < 0.75;
            message = success ? "Customer accepted offer and payment captured." : "Customer link expired.";
        } else {
            success = false;
            message = "Action stopped or unhandled.";
        }

        return new RazorpayExecutionResult(success, razorpayPaymentId, razorpayOrderId, message);
    }

    public static class RazorpayExecutionResult {
        private final boolean success;
        private final String razorpayPaymentId;
        private final String razorpayOrderId;
        private final String message;

        public RazorpayExecutionResult(boolean success, String razorpayPaymentId, String razorpayOrderId, String message) {
            this.success = success;
            this.razorpayPaymentId = razorpayPaymentId;
            this.razorpayOrderId = razorpayOrderId;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public String getMessage() { return message; }
    }
}
