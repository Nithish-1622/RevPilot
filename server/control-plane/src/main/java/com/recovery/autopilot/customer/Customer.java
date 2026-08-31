package com.recovery.autopilot.customer;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    private String id;

    @Column(name = "merchant_id", nullable = false)
    private String merchantId;

    @Column(nullable = false)
    private String email;

    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal ltv = BigDecimal.ZERO;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths = 0;

    private String segment = "STANDARD";

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public Customer() {}

    public Customer(String id, String merchantId, String email, String name, BigDecimal ltv, Integer tenureMonths, String segment) {
        this.id = id;
        this.merchantId = merchantId;
        this.email = email;
        this.name = name;
        this.ltv = ltv;
        this.tenureMonths = tenureMonths;
        this.segment = segment;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getLtv() { return ltv; }
    public void setLtv(BigDecimal ltv) { this.ltv = ltv; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
