package com.recovery.autopilot.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class OutboxService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final EventOutboxRepository eventOutboxRepository;

    public OutboxService(EventOutboxRepository eventOutboxRepository) {
        this.eventOutboxRepository = eventOutboxRepository;
    }

    @Transactional
    public void publishEvent(String aggregateType, String aggregateId, String eventType, Map<String, Object> payload) {
        try {
            String payloadJson = objectMapper.writeValueAsString(payload);
            EventOutbox outbox = new EventOutbox(
                UUID.randomUUID().toString(),
                aggregateType,
                aggregateId,
                eventType,
                payloadJson,
                "PENDING"
            );
            eventOutboxRepository.save(outbox);
        } catch (Exception e) {
            System.err.println("Failed to serialize outbox event payload: " + e.getMessage());
        }
    }
}
