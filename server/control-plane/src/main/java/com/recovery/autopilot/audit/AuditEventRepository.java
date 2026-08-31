package com.recovery.autopilot.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {
    List<AuditEvent> findByRecoveryCaseIdOrderByCreatedAtAsc(String recoveryCaseId);
    List<AuditEvent> findByPaymentIdOrderByCreatedAtAsc(String paymentId);
    List<AuditEvent> findTop50ByOrderByCreatedAtDesc();
}
