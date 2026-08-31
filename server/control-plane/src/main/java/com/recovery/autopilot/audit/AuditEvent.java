package com.recovery.autopilot.audit;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_events")
public class AuditEvent {

    @Id
    private String id;

    @Column(name = "recovery_case_id")
    private String recoveryCaseId;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(nullable = false)
    private String actor;

    @Column(name = "actor_type", nullable = false)
    private String actorType;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    private String action;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "input_hash")
    private String inputHash;

    private String decision;

    @Column(name = "policy_result")
    private String policyResult;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "agent_version")
    private String agentVersion;

    @Column(name = "correlation_id", nullable = false)
    private String correlationId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public AuditEvent() {}

    public AuditEvent(String id, String recoveryCaseId, String paymentId, String actor, String actorType, String eventType, String action, String reason, String decision, String policyResult, String correlationId) {
        this.id = id;
        this.recoveryCaseId = recoveryCaseId;
        this.paymentId = paymentId;
        this.actor = actor;
        this.actorType = actorType;
        this.eventType = eventType;
        this.action = action;
        this.reason = reason;
        this.decision = decision;
        this.policyResult = policyResult;
        this.correlationId = correlationId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecoveryCaseId() { return recoveryCaseId; }
    public void setRecoveryCaseId(String recoveryCaseId) { this.recoveryCaseId = recoveryCaseId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getActorType() { return actorType; }
    public void setActorType(String actorType) { this.actorType = actorType; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getInputHash() { return inputHash; }
    public void setInputHash(String inputHash) { this.inputHash = inputHash; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getPolicyResult() { return policyResult; }
    public void setPolicyResult(String policyResult) { this.policyResult = policyResult; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getAgentVersion() { return agentVersion; }
    public void setAgentVersion(String agentVersion) { this.agentVersion = agentVersion; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
