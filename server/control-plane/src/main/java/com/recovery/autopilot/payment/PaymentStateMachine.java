package com.recovery.autopilot.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
public class PaymentStateMachine {

    private static final Map<PaymentStatus, Set<PaymentStatus>> ALLOWED_TRANSITIONS = Map.of(
        PaymentStatus.CREATED, Set.of(PaymentStatus.PENDING, PaymentStatus.FAILED),
        PaymentStatus.PENDING, Set.of(PaymentStatus.FAILED, PaymentStatus.RECOVERED),
        PaymentStatus.FAILED, Set.of(PaymentStatus.RECOVERY_ELIGIBLE, PaymentStatus.RECOVERY_IN_PROGRESS, PaymentStatus.EXHAUSTED, PaymentStatus.BLOCKED),
        PaymentStatus.RECOVERY_ELIGIBLE, Set.of(PaymentStatus.RECOVERY_IN_PROGRESS, PaymentStatus.BLOCKED),
        PaymentStatus.RECOVERY_IN_PROGRESS, Set.of(PaymentStatus.RECOVERED, PaymentStatus.FAILED, PaymentStatus.EXHAUSTED, PaymentStatus.BLOCKED),
        PaymentStatus.RECOVERED, Set.of(),
        PaymentStatus.EXHAUSTED, Set.of(),
        PaymentStatus.BLOCKED, Set.of()
    );

    public boolean canTransition(PaymentStatus current, PaymentStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(PaymentStatus.class)).contains(next);
    }

    @Transactional
    public void transition(Payment payment, PaymentStatus targetStatus) {
        if (!canTransition(payment.getStatus(), targetStatus)) {
            throw new IllegalStateException(String.format("Invalid payment state transition from %s to %s for payment ID %s",
                payment.getStatus(), targetStatus, payment.getId()));
        }
        payment.setStatus(targetStatus);
    }
}
