package com.recovery.autopilot.customer;

import java.math.BigDecimal;

public class CustomerProfileDTO {

    private String customerId;
    private String merchantId;
    private String name;
    private String email;
    private String segment;
    private BigDecimal ltv;
    private Integer tenureMonths;
    private Double historicalSuccessRate;
    private Double historicalFailureRate;
    private Integer totalPaymentsCount;
    private Integer totalRecoveryAttempts;
    private Integer successfulRecoveriesCount;
    private String preferredPaymentInstrument;
    private BigDecimal averageTransactionAmount;
    private Double churnRiskScore;
    private String recoveryLatencyWindow;

    public CustomerProfileDTO() {}

    public CustomerProfileDTO(String customerId, String merchantId, String name, String email, String segment,
                              BigDecimal ltv, Integer tenureMonths, Double historicalSuccessRate, Double historicalFailureRate,
                              Integer totalPaymentsCount, Integer totalRecoveryAttempts, Integer successfulRecoveriesCount,
                              String preferredPaymentInstrument, BigDecimal averageTransactionAmount, Double churnRiskScore,
                              String recoveryLatencyWindow) {
        this.customerId = customerId;
        this.merchantId = merchantId;
        this.name = name;
        this.email = email;
        this.segment = segment;
        this.ltv = ltv;
        this.tenureMonths = tenureMonths;
        this.historicalSuccessRate = historicalSuccessRate;
        this.historicalFailureRate = historicalFailureRate;
        this.totalPaymentsCount = totalPaymentsCount;
        this.totalRecoveryAttempts = totalRecoveryAttempts;
        this.successfulRecoveriesCount = successfulRecoveriesCount;
        this.preferredPaymentInstrument = preferredPaymentInstrument;
        this.averageTransactionAmount = averageTransactionAmount;
        this.churnRiskScore = churnRiskScore;
        this.recoveryLatencyWindow = recoveryLatencyWindow;
    }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public BigDecimal getLtv() { return ltv; }
    public void setLtv(BigDecimal ltv) { this.ltv = ltv; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public Double getHistoricalSuccessRate() { return historicalSuccessRate; }
    public void setHistoricalSuccessRate(Double historicalSuccessRate) { this.historicalSuccessRate = historicalSuccessRate; }

    public Double getHistoricalFailureRate() { return historicalFailureRate; }
    public void setHistoricalFailureRate(Double historicalFailureRate) { this.historicalFailureRate = historicalFailureRate; }

    public Integer getTotalPaymentsCount() { return totalPaymentsCount; }
    public void setTotalPaymentsCount(Integer totalPaymentsCount) { this.totalPaymentsCount = totalPaymentsCount; }

    public Integer getTotalRecoveryAttempts() { return totalRecoveryAttempts; }
    public void setTotalRecoveryAttempts(Integer totalRecoveryAttempts) { this.totalRecoveryAttempts = totalRecoveryAttempts; }

    public Integer getSuccessfulRecoveriesCount() { return successfulRecoveriesCount; }
    public void setSuccessfulRecoveriesCount(Integer successfulRecoveriesCount) { this.successfulRecoveriesCount = successfulRecoveriesCount; }

    public String getPreferredPaymentInstrument() { return preferredPaymentInstrument; }
    public void setPreferredPaymentInstrument(String preferredPaymentInstrument) { this.preferredPaymentInstrument = preferredPaymentInstrument; }

    public BigDecimal getAverageTransactionAmount() { return averageTransactionAmount; }
    public void setAverageTransactionAmount(BigDecimal averageTransactionAmount) { this.averageTransactionAmount = averageTransactionAmount; }

    public Double getChurnRiskScore() { return churnRiskScore; }
    public void setChurnRiskScore(Double churnRiskScore) { this.churnRiskScore = churnRiskScore; }

    public String getRecoveryLatencyWindow() { return recoveryLatencyWindow; }
    public void setRecoveryLatencyWindow(String recoveryLatencyWindow) { this.recoveryLatencyWindow = recoveryLatencyWindow; }
}
