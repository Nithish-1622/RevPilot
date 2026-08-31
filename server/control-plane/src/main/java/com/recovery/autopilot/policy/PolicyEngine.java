package com.recovery.autopilot.policy;

import com.recovery.autopilot.recovery.RecoveryCase;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PolicyEngine {

    public PolicyEvaluationResult evaluate(RecoveryCase recoveryCase, RecoveryPolicy policy, String proposedAction, BigDecimal proposedDiscount) {
        
        // 1. Max Retry Attempts Check
        if (recoveryCase.getAttemptCount() >= policy.getMaxRetryAttempts() && 
           ("RETRY_NOW".equals(proposedAction) || "RETRY_LATER".equals(proposedAction))) {
            return new PolicyEvaluationResult(PolicyDecision.BLOCK, 
                String.format("Action %s blocked: Max retry attempts limit (%d) reached.", proposedAction, policy.getMaxRetryAttempts()));
        }

        // 2. Max Discount Percentage Check
        if (proposedDiscount != null && proposedDiscount.compareTo(policy.getMaxDiscountPercent()) > 0) {
            return new PolicyEvaluationResult(PolicyDecision.BLOCK, 
                String.format("Action blocked: Proposed discount %s%% exceeds merchant policy maximum limit of %s%%.", 
                    proposedDiscount.toPlainString(), policy.getMaxDiscountPercent().toPlainString()));
        }

        // 3. Minimum Recovery Probability Threshold Check
        if (recoveryCase.getRecoveryProbability() != null && 
            recoveryCase.getRecoveryProbability().compareTo(policy.getMinimumRecoveryProbability()) < 0) {
            return new PolicyEvaluationResult(PolicyDecision.BLOCK, 
                String.format("Action blocked: Calculated recovery probability (%s) is below merchant minimum threshold (%s).", 
                    recoveryCase.getRecoveryProbability().toPlainString(), policy.getMinimumRecoveryProbability().toPlainString()));
        }

        // 4. Monetary Approval Threshold Check
        if (recoveryCase.getAmount().compareTo(policy.getApprovalThreshold()) > 0 && !"STOP_RECOVERY".equals(proposedAction)) {
            return new PolicyEvaluationResult(PolicyDecision.ALLOW, 
                String.format("Action allowed with requirement: Transaction amount ₹%s exceeds threshold ₹%s, flagging for approval.",
                    recoveryCase.getAmount().toPlainString(), policy.getApprovalThreshold().toPlainString()), true);
        }

        // Default: Allow
        return new PolicyEvaluationResult(PolicyDecision.ALLOW, "Action complies with all merchant policy bounds.", false);
    }

    public static class PolicyEvaluationResult {
        private final PolicyDecision decision;
        private final String reason;
        private final boolean requiresApproval;

        public PolicyEvaluationResult(PolicyDecision decision, String reason) {
            this(decision, reason, false);
        }

        public PolicyEvaluationResult(PolicyDecision decision, String reason, boolean requiresApproval) {
            this.decision = decision;
            this.reason = reason;
            this.requiresApproval = requiresApproval;
        }

        public PolicyDecision getDecision() { return decision; }
        public String getReason() { return reason; }
        public boolean isRequiresApproval() { return requiresApproval; }
        public boolean isAllowed() { return decision == PolicyDecision.ALLOW; }
    }
}
