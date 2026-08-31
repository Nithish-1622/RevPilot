package com.recovery.autopilot.recovery;

import com.recovery.autopilot.infrastructure.ai.AiServiceClient.AiAnalysisResult;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class FallbackRecoveryService {

    public AiAnalysisResult computeFallbackAnalysis(String paymentId, BigDecimal amount, String failureCode, int attemptNumber) {
        AiAnalysisResult fallback = new AiAnalysisResult();
        fallback.setCaseId("REC-" + paymentId);
        
        BigDecimal prob;
        String action;
        String explanation;
        
        if ("TRANSIENT_FAILURE".equals(failureCode)) {
            prob = new BigDecimal("0.8500");
            action = "RETRY_NOW";
            explanation = "Fallback Policy: Transient failure detected. Selected immediate retry execution.";
        } else if ("INSUFFICIENT_FUNDS".equals(failureCode)) {
            prob = new BigDecimal("0.4500");
            action = "RETRY_LATER";
            explanation = "Fallback Policy: Insufficient balance. Selected delayed retry execution.";
        } else if ("EXPIRED_CARD".equals(failureCode)) {
            prob = new BigDecimal("0.7000");
            action = "REQUEST_PAYMENT_UPDATE";
            explanation = "Fallback Policy: Expired payment method. Selected payment update request.";
        } else {
            prob = new BigDecimal("0.2000");
            action = "STOP_RECOVERY";
            explanation = "Fallback Policy: Risk threshold exceeded or unknown error. Selected stop recovery.";
        }

        if (attemptNumber >= 3) {
            action = "STOP_RECOVERY";
            prob = new BigDecimal("0.1000");
            explanation = "Fallback Policy: Max retry attempts reached. Selected stop recovery.";
        }

        BigDecimal riskScore = BigDecimal.ONE.subtract(prob);
        BigDecimal expectedVal = amount.multiply(prob).setScale(2, RoundingMode.HALF_UP);

        fallback.setRiskScore(riskScore);
        fallback.setRecoveryProbability(prob);
        fallback.setExpectedRecoveryValue(expectedVal);
        fallback.setRecommendedAction(action);
        fallback.setConfidence(0.75);
        fallback.setReasonCodes(List.of("FALLBACK_RULE_TRIGGERED", failureCode));
        fallback.setExplanation(explanation);
        fallback.setModelVersion("fallback_rules_v1");
        fallback.setAgentVersion("fallback_agent_v1");
        fallback.setCacheHit(false);

        return fallback;
    }
}
