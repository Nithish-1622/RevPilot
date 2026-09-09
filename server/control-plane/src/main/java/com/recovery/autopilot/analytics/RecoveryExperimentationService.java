package com.recovery.autopilot.analytics;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class RecoveryExperimentationService {

    public Map<String, Object> runStrategyExperiment(String strategyA, String strategyB, int cohortSize) {
        Random rand = new Random(42);

        int recoveredA = (int) (cohortSize * (0.45 + (rand.nextDouble() * 0.08)));
        int recoveredB = (int) (cohortSize * (0.62 + (rand.nextDouble() * 0.08)));

        BigDecimal avgValue = new BigDecimal("4500.00");
        BigDecimal revA = avgValue.multiply(BigDecimal.valueOf(recoveredA));
        BigDecimal revB = avgValue.multiply(BigDecimal.valueOf(recoveredB));

        BigDecimal costA = new BigDecimal("15.00").multiply(BigDecimal.valueOf(cohortSize));
        BigDecimal costB = new BigDecimal("40.00").multiply(BigDecimal.valueOf(cohortSize));

        BigDecimal netA = revA.subtract(costA);
        BigDecimal netB = revB.subtract(costB);
        BigDecimal lift = netB.subtract(netA);

        Map<String, Object> result = new HashMap<>();
        result.put("experimentId", "EXP-" + UUID.randomUUID().toString().substring(0, 8));
        result.put("cohortSize", cohortSize);
        result.put("status", "COMPLETED");
        result.put("dataClassification", "SIMULATION_EXPERIMENTAL_DATA");
        
        Map<String, Object> dataA = new HashMap<>();
        dataA.put("strategyName", strategyA);
        dataA.put("recoveredCount", recoveredA);
        dataA.put("recoveryRate", round((double) recoveredA / cohortSize * 100.0));
        dataA.put("grossRevenue", revA);
        dataA.put("interventionCost", costA);
        dataA.put("netRevenue", netA);

        Map<String, Object> dataB = new HashMap<>();
        dataB.put("strategyName", strategyB);
        dataB.put("recoveredCount", recoveredB);
        dataB.put("recoveryRate", round((double) recoveredB / cohortSize * 100.0));
        dataB.put("grossRevenue", revB);
        dataB.put("interventionCost", costB);
        dataB.put("netRevenue", netB);

        result.put("strategyA", dataA);
        result.put("strategyB", dataB);
        result.put("netRevenueLift", lift);
        result.put("winningStrategy", lift.compareTo(BigDecimal.ZERO) > 0 ? strategyB : strategyA);

        return result;
    }

    private double round(double val) {
        return new BigDecimal(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
