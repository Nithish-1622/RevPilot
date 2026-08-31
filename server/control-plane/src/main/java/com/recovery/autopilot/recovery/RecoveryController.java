package com.recovery.autopilot.recovery;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recovery.autopilot.audit.AuditEvent;
import com.recovery.autopilot.audit.AuditEventRepository;
import com.recovery.autopilot.audit.AuditService;
import com.recovery.autopilot.common.IdempotencyKey;
import com.recovery.autopilot.common.IdempotencyService;
import com.recovery.autopilot.event.OutboxService;
import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentRepository;
import com.recovery.autopilot.payment.PaymentStateMachine;
import com.recovery.autopilot.payment.PaymentStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recovery/cases")
@CrossOrigin(origins = "*")
public class RecoveryController {

    private final RecoveryCaseRepository recoveryCaseRepository;
    private final RecoveryService recoveryService;
    private final AuditEventRepository auditEventRepository;
    private final IdempotencyService idempotencyService;
    private final PaymentRepository paymentRepository;
    private final PaymentStateMachine paymentStateMachine;
    private final AuditService auditService;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RecoveryController(
            RecoveryCaseRepository recoveryCaseRepository,
            RecoveryService recoveryService,
            AuditEventRepository auditEventRepository,
            IdempotencyService idempotencyService,
            PaymentRepository paymentRepository,
            PaymentStateMachine paymentStateMachine,
            AuditService auditService,
            OutboxService outboxService
    ) {
        this.recoveryCaseRepository = recoveryCaseRepository;
        this.recoveryService = recoveryService;
        this.auditEventRepository = auditEventRepository;
        this.idempotencyService = idempotencyService;
        this.paymentRepository = paymentRepository;
        this.paymentStateMachine = paymentStateMachine;
        this.auditService = auditService;
        this.outboxService = outboxService;
    }

    @GetMapping
    public List<RecoveryCase> getAllCases() {
        return recoveryCaseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecoveryCase> getCaseById(@PathVariable String id) {
        return recoveryCaseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCase(
            @RequestBody RecoveryCase inputCase,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        if (idempotencyKey != null) {
            String requestPayload = inputCase.getPaymentId() + ":" + inputCase.getAmount();
            Optional<IdempotencyKey> existing = idempotencyService.getOrReserveKey(
                idempotencyKey, inputCase.getMerchantId(), "CREATE_CASE", requestPayload
            );
            if (existing.isPresent()) {
                IdempotencyKey key = existing.get();
                if ("COMPLETED".equals(key.getStatus())) {
                    try {
                        RecoveryCase cached = objectMapper.readValue(key.getResponsePayload(), RecoveryCase.class);
                        return ResponseEntity.ok(cached);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to parse cached response");
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Request is currently being processed");
                }
            }
        }

        try {
            if (inputCase.getId() == null) {
                inputCase.setId("REC-" + UUID.randomUUID().toString().substring(0, 8));
            }
            if (inputCase.getStatus() == null) {
                inputCase.setStatus(RecoveryCaseStatus.RECOVERY_ELIGIBLE);
            }
            RecoveryCase saved = recoveryCaseRepository.save(inputCase);

            // Outbox event
            outboxService.publishEvent("RECOVERY_CASE", saved.getId(), "recovery.case.created.v1", Map.of(
                "caseId", saved.getId(),
                "paymentId", saved.getPaymentId(),
                "amount", saved.getAmount()
            ));

            if (idempotencyKey != null) {
                try {
                    String respJson = objectMapper.writeValueAsString(saved);
                    idempotencyService.completeKey(idempotencyKey, respJson);
                } catch (Exception e) {
                    System.err.println("Failed to serialize response for idempotency mapping: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            if (idempotencyKey != null) {
                idempotencyService.failKey(idempotencyKey);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Creation failed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<RecoveryCase> analyzeCase(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String failureCode = (body != null && body.containsKey("failureCode")) ? body.get("failureCode") : "TRANSIENT_FAILURE";
        RecoveryCase updated = recoveryService.analyzeCase(id, failureCode);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/execute")
    public ResponseEntity<?> executeRecovery(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        String failureCode = (body != null && body.containsKey("failureCode")) ? body.get("failureCode") : "TRANSIENT_FAILURE";

        if (idempotencyKey != null) {
            Optional<IdempotencyKey> existing = idempotencyService.getOrReserveKey(
                idempotencyKey, "merchant_unknown", "EXECUTE_RECOVERY", id + ":" + failureCode
            );
            if (existing.isPresent()) {
                IdempotencyKey key = existing.get();
                if ("COMPLETED".equals(key.getStatus())) {
                    try {
                        RecoveryCase cached = objectMapper.readValue(key.getResponsePayload(), RecoveryCase.class);
                        return ResponseEntity.ok(cached);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to parse cached response");
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Execution is currently processing");
                }
            }
        }

        try {
            RecoveryCase updated = recoveryService.executeRecovery(id, failureCode);

            if (idempotencyKey != null) {
                try {
                    String respJson = objectMapper.writeValueAsString(updated);
                    idempotencyService.completeKey(idempotencyKey, respJson);
                } catch (Exception e) {
                    System.err.println("Failed to serialize response for idempotency mapping: " + e.getMessage());
                }
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            if (idempotencyKey != null) {
                idempotencyService.failKey(idempotencyKey);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Execution failed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<RecoveryCase> stopRecovery(@PathVariable String id) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recovery case not found: " + id));

        Payment payment = paymentRepository.findById(recoveryCase.getPaymentId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        recoveryCase.setStatus(RecoveryCaseStatus.BLOCKED);
        paymentStateMachine.transition(payment, PaymentStatus.BLOCKED);

        String correlationId = UUID.randomUUID().toString();
        auditService.logEvent(id, payment.getId(), "MERCHANT_USER", "HUMAN", "RECOVERY_ACTION_BLOCKED", "STOP_RECOVERY", "Manual termination by merchant", "BLOCKED", "BLOCK", correlationId);
        outboxService.publishEvent("RECOVERY_CASE", id, "recovery.action.blocked.v1", Map.of("caseId", id, "reason", "Manual termination by merchant"));

        paymentRepository.save(payment);
        RecoveryCase saved = recoveryService.rejectCase(id);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<RecoveryCase> approveCase(@PathVariable String id) {
        RecoveryCase saved = recoveryService.approveCase(id);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<RecoveryCase> rejectCase(@PathVariable String id) {
        RecoveryCase saved = recoveryService.rejectCase(id);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/audit")
    public List<AuditEvent> getAuditTimeline(@PathVariable String id) {
        return auditEventRepository.findByRecoveryCaseIdOrderByCreatedAtAsc(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
}
