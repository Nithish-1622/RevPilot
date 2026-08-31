package com.recovery.autopilot.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventOutboxRepository extends JpaRepository<EventOutbox, String> {
    List<EventOutbox> findTop50ByStatusOrderByCreatedAtAsc(String status);
}
