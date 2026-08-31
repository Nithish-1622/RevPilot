package com.recovery.autopilot.recovery;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "recovery_cases")
public class RecoveryCase {

    @Id
    private String id;

    @Column(name = "payment_id", nullable = false, unique = true)
    private String paymentId;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "merchant_id", nullable = false)
    private String merchantId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "risk_score", precision = 5, scale = 4)
    private BigDecimal riskScore;

    @Column(name = "recovery_probability", precision = 5, scale = 4)
    private BigDecimal recoveryProbability;

    @Column(name = "expected_recovery_value", precision = 15, scale = 2)
    private BigDecimal expectedRecoveryValue;

    @Column(name = "recommended_action")
    private String recommendedAction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecoveryCaseStatus status;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 3;

    @Column(name = "next_action_at")
    private OffsetDateTime nextActionAt;

    @Version
    private Long version;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public RecoveryCase() {}

    public RecoveryCase(String id, String paymentId, String customerId, String merchantId, BigDecimal amount, RecoveryCaseStatus status) {
        this.id = id;
        this.paymentId = paymentId;
        this.customerId = customerId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }

    public BigDecimal getRecoveryProbability() { return recoveryProbability; }
    public void setRecoveryProbability(BigDecimal recoveryProbability) { this.recoveryProbability = recoveryProbability; }

    public BigDecimal getExpectedRecoveryValue() { return expectedRecoveryValue; }
    public void setExpectedRecoveryValue(BigDecimal expectedRecoveryValue) { this.expectedRecoveryValue = expectedRecoveryValue; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public RecoveryCaseStatus getStatus() { return status; }
    public void setStatus(RecoveryCaseStatus status) { this.status = status; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }

    public OffsetDateTime getNextActionAt() { return nextActionAt; }
    public void setNextActionAt(OffsetDateTime nextActionAt) { this.nextActionAt = nextActionAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
