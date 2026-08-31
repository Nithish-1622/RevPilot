package com.recovery.autopilot.infrastructure.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/models")
@CrossOrigin(origins = "*")
public class ModelController {

    private final AiServiceClient aiServiceClient;

    public ModelController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping
    public ResponseEntity<Map> getModelInfo() {
        return ResponseEntity.ok(aiServiceClient.getModelMetadata());
    }
}
