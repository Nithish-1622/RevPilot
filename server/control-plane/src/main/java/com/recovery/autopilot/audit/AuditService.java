package com.recovery.autopilot.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public void logEvent(String recoveryCaseId, String paymentId, String actor, String actorType, String eventType, String action, String reason, String decision, String policyResult, String correlationId) {
        AuditEvent event = new AuditEvent(
            UUID.randomUUID().toString(),
            recoveryCaseId,
            paymentId,
            actor,
            actorType,
            eventType,
            action,
            reason,
            decision,
            policyResult,
            correlationId != null ? correlationId : UUID.randomUUID().toString()
        );
        auditEventRepository.save(event);
    }
}
