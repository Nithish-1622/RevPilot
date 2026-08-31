package com.recovery.autopilot.payment;

public enum PaymentStatus {
    CREATED,
    PENDING,
    FAILED,
    RECOVERY_ELIGIBLE,
    RECOVERY_IN_PROGRESS,
    RECOVERED,
    EXHAUSTED,
    BLOCKED
}
