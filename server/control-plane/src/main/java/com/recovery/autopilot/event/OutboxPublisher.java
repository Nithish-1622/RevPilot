package com.recovery.autopilot.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class OutboxPublisher {

    private final EventOutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisher(EventOutboxRepository outboxRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<EventOutbox> pendingEvents = outboxRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        for (EventOutbox event : pendingEvents) {
            try {
                // Use eventType as topic name (e.g., payment.recovered.v1)
                String topic = event.getEventType();
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get(); // Block to ensure delivery

                event.setStatus("PUBLISHED");
                event.setPublishedAt(OffsetDateTime.now());
                outboxRepository.save(event);
            } catch (Exception e) {
                System.err.println("Failed to publish event ID " + event.getId() + " to Kafka: " + e.getMessage());
                event.setStatus("FAILED");
                outboxRepository.save(event);
            }
        }
    }
}
