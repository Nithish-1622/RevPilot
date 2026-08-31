package com.recovery.autopilot;

import com.recovery.autopilot.common.IdempotencyKey;
import com.recovery.autopilot.common.IdempotencyKeyRepository;
import com.recovery.autopilot.common.IdempotencyService;
import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentStateMachine;
import com.recovery.autopilot.payment.PaymentStatus;
import com.recovery.autopilot.policy.PolicyEngine;
import com.recovery.autopilot.policy.PolicyEngine.PolicyEvaluationResult;
import com.recovery.autopilot.policy.PolicyDecision;
import com.recovery.autopilot.policy.RecoveryPolicy;
import com.recovery.autopilot.razorpay.RazorpayWebhookController;
import com.recovery.autopilot.razorpay.WebhookEventRepository;
import com.recovery.autopilot.recovery.RecoveryCase;
import com.recovery.autopilot.recovery.RecoveryCaseStatus;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class RecoveryWorkflowTest {

    private final PaymentStateMachine stateMachine = new PaymentStateMachine();
    private final PolicyEngine policyEngine = new PolicyEngine();

    // --- State Machine Transition Tests ---

    @Test
    public void testStateMachineCreatedToPending() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.CREATED);
        stateMachine.transition(payment, PaymentStatus.PENDING);
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
    }

    @Test
    public void testStateMachineCreatedToFailed() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.CREATED);
        stateMachine.transition(payment, PaymentStatus.FAILED);
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
    }

    @Test
    public void testStateMachineFailedToRecoveryEligible() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.FAILED);
        stateMachine.transition(payment, PaymentStatus.RECOVERY_ELIGIBLE);
        assertEquals(PaymentStatus.RECOVERY_ELIGIBLE, payment.getStatus());
    }

    @Test
    public void testStateMachineRecoveryEligibleToInProgress() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.RECOVERY_ELIGIBLE);
        stateMachine.transition(payment, PaymentStatus.RECOVERY_IN_PROGRESS);
        assertEquals(PaymentStatus.RECOVERY_IN_PROGRESS, payment.getStatus());
    }

    @Test
    public void testStateMachineInProgressToRecovered() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.RECOVERY_IN_PROGRESS);
        stateMachine.transition(payment, PaymentStatus.RECOVERED);
        assertEquals(PaymentStatus.RECOVERED, payment.getStatus());
    }

    @Test
    public void testStateMachineInProgressToExhausted() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.RECOVERY_IN_PROGRESS);
        stateMachine.transition(payment, PaymentStatus.EXHAUSTED);
        assertEquals(PaymentStatus.EXHAUSTED, payment.getStatus());
    }

    @Test
    public void testStateMachineInProgressToBlocked() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.RECOVERY_IN_PROGRESS);
        stateMachine.transition(payment, PaymentStatus.BLOCKED);
        assertEquals(PaymentStatus.BLOCKED, payment.getStatus());
    }

    // --- Invalid State Transition Matrix Tests ---

    @Test
    public void testInvalidTransitionCreatedToRecovered() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.CREATED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.RECOVERED));
    }

    @Test
    public void testInvalidTransitionFailedToCreated() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.FAILED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.CREATED));
    }

    @Test
    public void testInvalidTransitionRecoveredToInProgress() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.RECOVERED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.RECOVERY_IN_PROGRESS));
    }

    @Test
    public void testInvalidTransitionExhaustedToRecovered() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.EXHAUSTED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.RECOVERED));
    }

    @Test
    public void testInvalidTransitionBlockedToRecoveryEligible() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.BLOCKED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.RECOVERY_ELIGIBLE));
    }

    @Test
    public void testInvalidTransitionCreatedToRecoveryEligible() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.CREATED);
        assertThrows(IllegalStateException.class, () -> stateMachine.transition(payment, PaymentStatus.RECOVERY_ELIGIBLE));
    }

    // --- Policy Engine Bounds Tests ---

    @Test
    public void testPolicyEngineMaxRetryAttemptsExceeded() {
        RecoveryPolicy policy = new RecoveryPolicy();
        policy.setMaxRetryAttempts(2);

        RecoveryCase caseObj = new RecoveryCase();
        caseObj.setAmount(new BigDecimal("100.00"));
        caseObj.setAttemptCount(2);

        PolicyEvaluationResult result = policyEngine.evaluate(caseObj, policy, "RETRY_NOW", BigDecimal.ZERO);
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("Max retry attempts limit"));
    }

    @Test
    public void testPolicyEngineDiscountCompliant() {
        RecoveryPolicy policy = new RecoveryPolicy();
        policy.setMaxDiscountPercent(new BigDecimal("15.00"));
        policy.setMinimumRecoveryProbability(new BigDecimal("0.40"));
        policy.setMaxRetryAttempts(2);

        RecoveryCase caseObj = new RecoveryCase();
        caseObj.setAmount(new BigDecimal("100.00"));
        caseObj.setAttemptCount(0);
        caseObj.setRecoveryProbability(new BigDecimal("0.50"));

        PolicyEvaluationResult result = policyEngine.evaluate(caseObj, policy, "OFFER_INCENTIVE", new BigDecimal("10.00"));
        assertTrue(result.isAllowed());
    }

    @Test
    public void testPolicyEngineDiscountExceeded() {
        RecoveryPolicy policy = new RecoveryPolicy();
        policy.setMaxDiscountPercent(new BigDecimal("15.00"));
        policy.setMinimumRecoveryProbability(new BigDecimal("0.40"));

        RecoveryCase caseObj = new RecoveryCase();
        caseObj.setAmount(new BigDecimal("100.00"));
        caseObj.setAttemptCount(0);
        caseObj.setRecoveryProbability(new BigDecimal("0.50"));

        PolicyEvaluationResult blockedResult = policyEngine.evaluate(caseObj, policy, "OFFER_INCENTIVE", new BigDecimal("20.00"));
        assertFalse(blockedResult.isAllowed());
        assertTrue(blockedResult.getReason().contains("exceeds merchant policy maximum limit"));
    }

    @Test
    public void testPolicyEngineProbabilityBelowThreshold() {
        RecoveryPolicy policy = new RecoveryPolicy();
        policy.setMinimumRecoveryProbability(new BigDecimal("0.40"));

        RecoveryCase caseObj = new RecoveryCase();
        caseObj.setAmount(new BigDecimal("100.00"));
        caseObj.setAttemptCount(0);
        caseObj.setRecoveryProbability(new BigDecimal("0.30"));

        PolicyEvaluationResult result = policyEngine.evaluate(caseObj, policy, "RETRY_NOW", BigDecimal.ZERO);
        assertFalse(result.isAllowed());
        assertTrue(result.getReason().contains("below merchant minimum threshold"));
    }

    @Test
    public void testPolicyEngineMonetaryApprovalThresholdGating() {
        RecoveryPolicy policy = new RecoveryPolicy();
        policy.setApprovalThreshold(new BigDecimal("5000.00"));
        policy.setMinimumRecoveryProbability(new BigDecimal("0.40"));

        RecoveryCase caseObj = new RecoveryCase();
        caseObj.setAmount(new BigDecimal("12000.00")); // exceeds 5000
        caseObj.setAttemptCount(0);
        caseObj.setRecoveryProbability(new BigDecimal("0.80"));

        PolicyEvaluationResult result = policyEngine.evaluate(caseObj, policy, "RETRY_NOW", BigDecimal.ZERO);
        assertTrue(result.isAllowed());
        assertTrue(result.isRequiresApproval()); // requires human approval flag set to true!
    }

    // --- Idempotency Service & Concurrency Lock Tests ---

    @Test
    public void testIdempotencyReserveNewKey() {
        IdempotencyKeyRepository repository = Mockito.mock(IdempotencyKeyRepository.class);
        IdempotencyService service = new IdempotencyService(repository);

        String key = "idempotency-key-001";
        when(repository.findByIdempotencyKey(key)).thenReturn(Optional.empty());

        Optional<IdempotencyKey> result = service.getOrReserveKey(key, "m1", "EXECUTE", "payload1");
        assertFalse(result.isPresent());
    }

    @Test
    public void testIdempotencyReturnExistingProcessingKey() {
        IdempotencyKeyRepository repository = Mockito.mock(IdempotencyKeyRepository.class);
        IdempotencyService service = new IdempotencyService(repository);

        String key = "idempotency-key-002";
        IdempotencyKey mockKey = new IdempotencyKey("1", key, "m1", "EXECUTE", "hash", "PROCESSING");
        when(repository.findByIdempotencyKey(key)).thenReturn(Optional.of(mockKey));

        Optional<IdempotencyKey> result = service.getOrReserveKey(key, "m1", "EXECUTE", "payload1");
        assertTrue(result.isPresent());
        assertEquals("PROCESSING", result.get().getStatus());
    }

    @Test
    public void testIdempotencyReturnExistingCompletedKey() {
        IdempotencyKeyRepository repository = Mockito.mock(IdempotencyKeyRepository.class);
        IdempotencyService service = new IdempotencyService(repository);

        String key = "idempotency-key-003";
        IdempotencyKey mockKey = new IdempotencyKey("1", key, "m1", "EXECUTE", "hash", "COMPLETED");
        mockKey.setResponsePayload("{\"status\":\"SUCCESS\"}");
        when(repository.findByIdempotencyKey(key)).thenReturn(Optional.of(mockKey));

        Optional<IdempotencyKey> result = service.getOrReserveKey(key, "m1", "EXECUTE", "payload1");
        assertTrue(result.isPresent());
        assertEquals("COMPLETED", result.get().getStatus());
        assertEquals("{\"status\":\"SUCCESS\"}", result.get().getResponsePayload());
    }

    // --- Webhook Signature Verification Tests ---

    @Test
    public void testWebhookInvalidSignatureRejection() {
        WebhookEventRepository repository = Mockito.mock(WebhookEventRepository.class);
        RazorpayWebhookController controller = new RazorpayWebhookController(repository);

        String body = "{\"id\":\"evt_100\",\"event\":\"payment.captured\"}";
        ResponseEntity<String> response = controller.handleWebhook(body, "invalid_signature");
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid signature", response.getBody());
    }

    @Test
    public void testWebhookValidSignature() {
        WebhookEventRepository repository = Mockito.mock(WebhookEventRepository.class);
        RazorpayWebhookController controller = new RazorpayWebhookController(repository);

        String body = "{\"id\":\"evt_101\",\"event\":\"payment.captured\"}";
        String validSig = calculateHmacSha256(body, "rzp_test_webhook_secret");

        ResponseEntity<String> response = controller.handleWebhook(body, validSig);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Webhook processed successfully"));
    }

    private String calculateHmacSha256(String data, String secret) {
        try {
            Mac sha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256.init(secretKey);
            byte[] hash = sha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
