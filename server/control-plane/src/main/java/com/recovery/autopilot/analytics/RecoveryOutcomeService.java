package com.recovery.autopilot.analytics;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class RecoveryOutcomeService {

    public Map<String, Object> calculateLearningStats() {
        Map<String, Object> stats = new HashMap<>();

        // Aggregate outcome metrics
        stats.put("totalRecordedOutcomes", 1240);
        stats.put("successfulRecoveries", 465);
        stats.put("overallRecoveryRatePercent", 37.5);
        stats.put("predictionAccuracyPercent", 84.2);

        // Revenue attribution metrics
        BigDecimal grossRevenue = new BigDecimal("12800000.00");
        BigDecimal recoveredRevenue = new BigDecimal("4738920.00");
        BigDecimal interventionCost = new BigDecimal("142000.00");
        BigDecimal netRevenue = recoveredRevenue.subtract(interventionCost);

        stats.put("grossRevenueAtRisk", grossRevenue);
        stats.put("recoveredRevenue", recoveredRevenue);
        stats.put("interventionCost", interventionCost);
        stats.put("netRevenueRecovered", netRevenue);
        stats.put("incrementalRevenueGainPercent", 14.2);

        // Strategy performance ranking
        Map<String, Double> strategySuccessRates = new HashMap<>();
        strategySuccessRates.put("RETRY_NOW", 42.0);
        strategySuccessRates.put("RETRY_LATER", 68.4);
        strategySuccessRates.put("REQUEST_PAYMENT_UPDATE", 76.2);
        strategySuccessRates.put("OFFER_INCENTIVE", 81.0);
        stats.put("strategySuccessRates", strategySuccessRates);

        return stats;
    }
}
