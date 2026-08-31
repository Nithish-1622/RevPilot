package com.recovery.autopilot.razorpay;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/razorpay/webhooks")
@CrossOrigin(origins = "*")
public class RazorpayWebhookController {

    @Value("${razorpay.webhook-secret:rzp_test_webhook_secret}")
    private String webhookSecret = "rzp_test_webhook_secret";

    private final WebhookEventRepository webhookEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RazorpayWebhookController(WebhookEventRepository webhookEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        // 1. Verify cryptographic signature
        if (!verifySignature(rawBody, signature)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String eventId = root.path("id").asText();
            String eventType = root.path("event").asText();

            if (eventId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing event ID");
            }

            // 2. Persist event ID & verify idempotency
            if (webhookEventRepository.findByEventId(eventId).isPresent()) {
                return ResponseEntity.ok("Event already processed"); // Idempotent
            }

            WebhookEvent webhookEvent = new WebhookEvent(
                UUID.randomUUID().toString(),
                eventId,
                "RAZORPAY",
                eventType,
                rawBody,
                true
            );
            webhookEvent.setProcessedAt(OffsetDateTime.now());
            webhookEventRepository.save(webhookEvent);

            // Handle event logic here if needed (e.g. payment.captured, payment.failed)
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing failed: " + e.getMessage());
        }
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac sha256HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256HMAC.init(secretKey);
            byte[] hash = sha256HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
