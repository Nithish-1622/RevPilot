package com.recovery.autopilot.recovery;

public enum RecoveryActionType {
    RETRY_NOW,
    RETRY_LATER,
    SEND_PAYMENT_REMINDER,
    REQUEST_PAYMENT_UPDATE,
    OFFER_INCENTIVE,
    HUMAN_ESCALATION,
    STOP_RECOVERY
}
