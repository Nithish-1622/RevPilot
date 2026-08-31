package com.recovery.autopilot.policy;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "recovery_policies")
public class RecoveryPolicy {

    @Id
    private String id;

    @Column(name = "merchant_id", nullable = false)
    private String merchantId;

    @Column(name = "max_retry_attempts", nullable = false)
    private Integer maxRetryAttempts = 2;

    @Column(name = "max_discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal maxDiscountPercent = new BigDecimal("15.00");

    @Column(name = "approval_threshold", nullable = false, precision = 15, scale = 2)
    private BigDecimal approvalThreshold = new BigDecimal("5000.00");

    @Column(name = "max_customer_contacts", nullable = false)
    private Integer maxCustomerContacts = 2;

    @Column(name = "minimum_recovery_probability", nullable = false, precision = 5, scale = 4)
    private BigDecimal minimumRecoveryProbability = new BigDecimal("0.4000");

    @Column(name = "cooldown_minutes", nullable = false)
    private Integer cooldownMinutes = 120;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public RecoveryPolicy() {}

    public RecoveryPolicy(String id, String merchantId, Integer maxRetryAttempts, BigDecimal maxDiscountPercent, BigDecimal approvalThreshold, Integer maxCustomerContacts, BigDecimal minimumRecoveryProbability, Integer cooldownMinutes) {
        this.id = id;
        this.merchantId = merchantId;
        this.maxRetryAttempts = maxRetryAttempts;
        this.maxDiscountPercent = maxDiscountPercent;
        this.approvalThreshold = approvalThreshold;
        this.maxCustomerContacts = maxCustomerContacts;
        this.minimumRecoveryProbability = minimumRecoveryProbability;
        this.cooldownMinutes = cooldownMinutes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public Integer getMaxRetryAttempts() { return maxRetryAttempts; }
    public void setMaxRetryAttempts(Integer maxRetryAttempts) { this.maxRetryAttempts = maxRetryAttempts; }

    public BigDecimal getMaxDiscountPercent() { return maxDiscountPercent; }
    public void setMaxDiscountPercent(BigDecimal maxDiscountPercent) { this.maxDiscountPercent = maxDiscountPercent; }

    public BigDecimal getApprovalThreshold() { return approvalThreshold; }
    public void setApprovalThreshold(BigDecimal approvalThreshold) { this.approvalThreshold = approvalThreshold; }

    public Integer getMaxCustomerContacts() { return maxCustomerContacts; }
    public void setMaxCustomerContacts(Integer maxCustomerContacts) { this.maxCustomerContacts = maxCustomerContacts; }

    public BigDecimal getMinimumRecoveryProbability() { return minimumRecoveryProbability; }
    public void setMinimumRecoveryProbability(BigDecimal minimumRecoveryProbability) { this.minimumRecoveryProbability = minimumRecoveryProbability; }

    public Integer getCooldownMinutes() { return cooldownMinutes; }
    public void setCooldownMinutes(Integer cooldownMinutes) { this.cooldownMinutes = cooldownMinutes; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
