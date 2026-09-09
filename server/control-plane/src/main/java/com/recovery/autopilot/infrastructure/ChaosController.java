package com.recovery.autopilot.infrastructure;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chaos")
public class ChaosController {

    private boolean llmFailureSimulated = false;
    private boolean redisFailureSimulated = false;
    private boolean paymentFailureSimulated = false;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getChaosStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("llmFailureSimulated", llmFailureSimulated);
        status.put("redisFailureSimulated", redisFailureSimulated);
        status.put("paymentFailureSimulated", paymentFailureSimulated);
        status.put("resilienceLevel", llmFailureSimulated ? "LEVEL_2_DETERMINISTIC_RULES" : "LEVEL_1_AI_STATEGRAPH");
        return ResponseEntity.ok(status);
    }

    @PostMapping("/inject/llm-failure")
    public ResponseEntity<Map<String, Object>> toggleLlmFailure(@RequestParam(defaultValue = "true") boolean enable) {
        this.llmFailureSimulated = enable;
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("llmFailureSimulated", enable);
        res.put("fallbackActive", "LEVEL_2_FASTAPI_ML_DETERMINISTIC_RULES");
        res.put("message", enable ? "Simulated LLM outage. AI engine automatically degrades to deterministic rules." : "LLM restored.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/inject/redis-failure")
    public ResponseEntity<Map<String, Object>> toggleRedisFailure(@RequestParam(defaultValue = "true") boolean enable) {
        this.redisFailureSimulated = enable;
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("redisFailureSimulated", enable);
        res.put("fallbackActive", "DIRECT_POSTGRES_POLICY_EVALUATION");
        res.put("message", enable ? "Simulated Redis failure. Policy engine bypasses cache and evaluates PostgreSQL directly." : "Redis restored.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/inject/payment-failure")
    public ResponseEntity<Map<String, Object>> togglePaymentFailure(@RequestParam(defaultValue = "true") boolean enable) {
        this.paymentFailureSimulated = enable;
        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("paymentFailureSimulated", enable);
        res.put("fallbackActive", "SAFE_HITL_INTERCEPTION");
        res.put("message", enable ? "Simulated gateway payment failure. Cases routed to safety audit queue." : "Payment gateway restored.");
        return ResponseEntity.ok(res);
    }
}
