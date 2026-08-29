-- RevPilot PostgreSQL Initial Database Schema (Flyway V1)
-- Precision Financial Types: DECIMAL(15, 2)

-- 1. Merchants Table
CREATE TABLE merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key_hash VARCHAR(255) NOT NULL,
    auto_recovery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE customers (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    ltv DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tenure_months INT NOT NULL DEFAULT 0,
    segment VARCHAR(64) DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payments Table
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id),
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL, -- CREATED, PENDING, FAILED, RECOVERY_ELIGIBLE, RECOVERY_IN_PROGRESS, RECOVERED, EXHAUSTED, BLOCKED
    payment_method VARCHAR(64),
    razorpay_payment_id VARCHAR(128),
    razorpay_order_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payment Failures Table
CREATE TABLE payment_failures (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    failure_code VARCHAR(64) NOT NULL, -- INSUFFICIENT_FUNDS, NETWORK_TIMEOUT, EXPIRED_CARD, FRAUD_SUSPECTED, etc.
    failure_reason VARCHAR(255),
    gateway_error_code VARCHAR(128),
    gateway_error_desc TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Recovery Cases Table
CREATE TABLE recovery_cases (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id),
    amount DECIMAL(15, 2) NOT NULL,
    risk_score DECIMAL(5, 4),
    recovery_probability DECIMAL(5, 4),
    expected_recovery_value DECIMAL(15, 2),
    recommended_action VARCHAR(64),
    status VARCHAR(32) NOT NULL, -- RECOVERY_ELIGIBLE, RECOVERY_IN_PROGRESS, RECOVERED, EXHAUSTED, BLOCKED
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    next_action_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Recovery Predictions Table
CREATE TABLE recovery_predictions (
    id VARCHAR(64) PRIMARY KEY,
    recovery_case_id VARCHAR(64) NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    model_name VARCHAR(128) NOT NULL,
    model_version VARCHAR(64) NOT NULL,
    risk_score DECIMAL(5, 4) NOT NULL,
    recovery_probability DECIMAL(5, 4) NOT NULL,
    expected_recovery_value DECIMAL(15, 2) NOT NULL,
    shap_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Recovery Actions Table
CREATE TABLE recovery_actions (
    id VARCHAR(64) PRIMARY KEY,
    recovery_case_id VARCHAR(64) NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL, -- RETRY_NOW, RETRY_LATER, SEND_PAYMENT_REMINDER, REQUEST_PAYMENT_UPDATE, OFFER_INCENTIVE, HUMAN_ESCALATION, STOP_RECOVERY
    status VARCHAR(32) NOT NULL, -- PROPOSED, APPROVED, BLOCKED, EXECUTED, FAILED, SUCCESS
    action_cost DECIMAL(15, 2) DEFAULT 0.00,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    reason_code VARCHAR(64),
    execution_result JSONB,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Recovery Policies Table
CREATE TABLE recovery_policies (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    max_retry_attempts INT NOT NULL DEFAULT 2,
    max_discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    approval_threshold DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
    max_customer_contacts INT NOT NULL DEFAULT 2,
    minimum_recovery_probability DECIMAL(5, 4) NOT NULL DEFAULT 0.4000,
    cooldown_minutes INT NOT NULL DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Events Table
CREATE TABLE audit_events (
    id VARCHAR(64) PRIMARY KEY,
    recovery_case_id VARCHAR(64) REFERENCES recovery_cases(id) ON DELETE SET NULL,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
    actor VARCHAR(128) NOT NULL, -- SYSTEM, AGENT, MERCHANT_USER, POLICY_ENGINE
    actor_type VARCHAR(64) NOT NULL, -- AI, HUMAN, RULE_ENGINE
    event_type VARCHAR(128) NOT NULL, -- PAYMENT_FAILED, AI_ANALYSIS_COMPLETED, POLICY_CHECKED, ACTION_APPROVED, ACTION_BLOCKED, EXECUTED, RECOVERED, etc.
    action VARCHAR(64),
    reason TEXT,
    input_hash VARCHAR(128),
    decision VARCHAR(64),
    policy_result VARCHAR(32), -- ALLOW, BLOCK
    model_version VARCHAR(64),
    agent_version VARCHAR(64),
    correlation_id VARCHAR(128) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Agent Decisions Table
CREATE TABLE agent_decisions (
    id VARCHAR(64) PRIMARY KEY,
    recovery_case_id VARCHAR(64) NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    agent_version VARCHAR(64) NOT NULL,
    prompt_version VARCHAR(64) NOT NULL,
    decision_json JSONB NOT NULL,
    reasoning_trace TEXT,
    confidence_score DECIMAL(5, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. API Idempotency Keys Table
CREATE TABLE api_idempotency_keys (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id),
    operation VARCHAR(128) NOT NULL,
    request_hash VARCHAR(128) NOT NULL,
    response_payload JSONB,
    status VARCHAR(32) NOT NULL, -- PROCESSING, COMPLETED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Model Predictions Table
CREATE TABLE model_predictions (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL REFERENCES payments(id),
    model_name VARCHAR(128) NOT NULL,
    model_version VARCHAR(64) NOT NULL,
    feature_vector JSONB NOT NULL,
    predicted_probability DECIMAL(5, 4) NOT NULL,
    inference_time_ms INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. LLM Cache Entries Table
CREATE TABLE llm_cache_entries (
    id VARCHAR(64) PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    model_name VARCHAR(128) NOT NULL,
    prompt_version VARCHAR(64) NOT NULL,
    response_text TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    recovery_case_id VARCHAR(64) REFERENCES recovery_cases(id),
    type VARCHAR(64) NOT NULL, -- EMAIL, SMS, WHATSAPP, PAYMENT_LINK
    content TEXT NOT NULL,
    status VARCHAR(32) NOT NULL, -- SENT, FAILED, DELIVERED
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Webhook Events Table
CREATE TABLE webhook_events (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(128) NOT NULL UNIQUE,
    source VARCHAR(64) NOT NULL DEFAULT 'RAZORPAY',
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Event Outbox Table (Transactional Outbox Pattern)
CREATE TABLE event_outbox (
    id VARCHAR(64) PRIMARY KEY,
    aggregate_type VARCHAR(64) NOT NULL, -- PAYMENT, RECOVERY_CASE, AUDIT
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, PUBLISHED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for High Performance Querying
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_payment_failures_payment_id ON payment_failures(payment_id);
CREATE INDEX idx_payment_failures_failure_code ON payment_failures(failure_code);

CREATE INDEX idx_recovery_cases_merchant_id ON recovery_cases(merchant_id);
CREATE INDEX idx_recovery_cases_payment_id ON recovery_cases(payment_id);
CREATE INDEX idx_recovery_cases_status ON recovery_cases(status);
CREATE INDEX idx_recovery_cases_risk_score ON recovery_cases(risk_score);
CREATE INDEX idx_recovery_cases_recovery_prob ON recovery_cases(recovery_probability);

CREATE INDEX idx_audit_events_recovery_case_id ON audit_events(recovery_case_id);
CREATE INDEX idx_audit_events_payment_id ON audit_events(payment_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

CREATE INDEX idx_outbox_status ON event_outbox(status);
