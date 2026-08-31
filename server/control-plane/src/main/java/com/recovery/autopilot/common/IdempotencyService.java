package com.recovery.autopilot.common;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.util.Optional;
import java.util.UUID;

@Service
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;

    public IdempotencyService(IdempotencyKeyRepository repository) {
        this.repository = repository;
    }

    public String computeHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<IdempotencyKey> getOrReserveKey(String idempotencyKey, String merchantId, String operation, String requestPayload) {
        Optional<IdempotencyKey> existing = repository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return existing;
        }

        String hash = computeHash(requestPayload);
        IdempotencyKey newKey = new IdempotencyKey(
            UUID.randomUUID().toString(),
            idempotencyKey,
            merchantId,
            operation,
            hash,
            "PROCESSING"
        );
        repository.save(newKey);
        return Optional.empty();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void completeKey(String idempotencyKey, String responsePayload) {
        repository.findByIdempotencyKey(idempotencyKey).ifPresent(key -> {
            key.setStatus("COMPLETED");
            key.setResponsePayload(responsePayload);
            repository.save(key);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void failKey(String idempotencyKey) {
        repository.findByIdempotencyKey(idempotencyKey).ifPresent(key -> {
            key.setStatus("FAILED");
            repository.save(key);
        });
    }
}
