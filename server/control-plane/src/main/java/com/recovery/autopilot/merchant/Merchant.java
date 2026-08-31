package com.recovery.autopilot.merchant;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "merchants")
public class Merchant {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "api_key_hash", nullable = false)
    private String apiKeyHash;

    @Column(name = "auto_recovery_enabled", nullable = false)
    private Boolean autoRecoveryEnabled = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public Merchant() {}

    public Merchant(String id, String name, String email, String apiKeyHash) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.apiKeyHash = apiKeyHash;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getApiKeyHash() { return apiKeyHash; }
    public void setApiKeyHash(String apiKeyHash) { this.apiKeyHash = apiKeyHash; }

    public Boolean getAutoRecoveryEnabled() { return autoRecoveryEnabled; }
    public void setAutoRecoveryEnabled(Boolean autoRecoveryEnabled) { this.autoRecoveryEnabled = autoRecoveryEnabled; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
