package com.recovery.autopilot.razorpay;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "webhook_events")
public class WebhookEvent {

    @Id
    private String id;

    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    @Column(nullable = false)
    private String source = "RAZORPAY";

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(nullable = false, columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    private String payload;

    @Column(nullable = false)
    private boolean processed = false;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public WebhookEvent() {}

    public WebhookEvent(String id, String eventId, String source, String eventType, String payload, boolean processed) {
        this.id = id;
        this.eventId = eventId;
        this.source = source;
        this.eventType = eventType;
        this.payload = payload;
        this.processed = processed;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }

    public OffsetDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(OffsetDateTime processedAt) { this.processedAt = processedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
