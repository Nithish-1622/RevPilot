package com.recovery.autopilot.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/intelligence")
@CrossOrigin(origins = "*")
public class IntelligenceController {

    private final RecoveryExperimentationService experimentationService;

    public IntelligenceController(RecoveryExperimentationService experimentationService) {
        this.experimentationService = experimentationService;
    }

    @GetMapping("/strategy-performance")
    public ResponseEntity<Map<String, Object>> getStrategyPerformance() {
        Map<String, Object> res = new HashMap<>();

        List<Map<String, Object>> strategies = new ArrayList<>();

        Map<String, Object> s1 = new HashMap<>();
        s1.put("strategyId", "SMART_RETRY_SMART_SCHEDULE");
        s1.put("strategyName", "Liquidity-Aware Smart Retry");
        s1.put("predictedRecoveryRate", 82.0);
        s1.put("actualRecoveryRate", 84.5);
        s1.put("predictionAccuracy", 97.0);
        s1.put("totalExecutions", 1420);
        s1.put("avgRecoveryTimeMinutes", 38);
        strategies.add(s1);

        Map<String, Object> s2 = new HashMap<>();
        s2.put("strategyId", "COMMUNICATION_AND_DISCOUNT_OFFER");
        s2.put("strategyName", "WhatsApp Reminder + 5% Incentive");
        s2.put("predictedRecoveryRate", 68.0);
        s2.put("actualRecoveryRate", 71.2);
        s2.put("predictionAccuracy", 95.3);
        s2.put("totalExecutions", 850);
        s2.put("avgRecoveryTimeMinutes", 120);
        strategies.add(s2);

        Map<String, Object> s3 = new HashMap<>();
        s3.put("strategyId", "INTERACTION_GATEWAY_SWITCH");
        s3.put("strategyName", "Gateway Route Switching");
        s3.put("predictedRecoveryRate", 54.0);
        s3.put("actualRecoveryRate", 52.8);
        s3.put("predictionAccuracy", 97.7);
        s3.put("totalExecutions", 310);
        s3.put("avgRecoveryTimeMinutes", 5);
        strategies.add(s3);

        res.put("strategies", strategies);
        res.put("topPerformingStrategy", "SMART_RETRY_SMART_SCHEDULE");
        res.put("modelVersion", "v2.4.0-xgb");
        res.put("calibrationScore", 0.942);
        res.put("rocAuc", 0.887);
        res.put("f1Score", 0.831);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/experiments")
    public ResponseEntity<Map<String, Object>> getExperiments(
            @RequestParam(defaultValue = "SMART_RETRY") String strategyA,
            @RequestParam(defaultValue = "DISCOUNT_OFFER") String strategyB,
            @RequestParam(defaultValue = "1000") int cohortSize
    ) {
        Map<String, Object> experiment = experimentationService.runStrategyExperiment(strategyA, strategyB, cohortSize);
        return ResponseEntity.ok(experiment);
    }
}
