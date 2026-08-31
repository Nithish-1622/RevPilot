package com.recovery.autopilot;

import com.recovery.autopilot.common.IdempotencyKey;
import com.recovery.autopilot.common.IdempotencyKeyRepository;
import com.recovery.autopilot.common.IdempotencyService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class IdempotencyConcurrencyTest {

    @Test
    public void testConcurrentIdempotencyRequests() throws InterruptedException {
        IdempotencyKeyRepository repository = Mockito.mock(IdempotencyKeyRepository.class);
        IdempotencyService service = new IdempotencyService(repository);

        String key = "concurrent-idempotency-key-999";
        java.util.concurrent.atomic.AtomicBoolean isReserved = new java.util.concurrent.atomic.AtomicBoolean(false);

        // First thread gets empty (reserves key), all concurrent threads get existing PROCESSING key
        when(repository.findByIdempotencyKey(key)).thenAnswer(invocation -> {
            if (isReserved.compareAndSet(false, true)) {
                return Optional.empty();
            } else {
                return Optional.of(new IdempotencyKey("1", key, "m1", "EXECUTE", "hash", "PROCESSING"));
            }
        });

        int threads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger existingCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    Optional<IdempotencyKey> result = service.getOrReserveKey(key, "m1", "EXECUTE", "payload");
                    if (result.isEmpty()) {
                        successCount.incrementAndGet();
                    } else {
                        existingCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        while (!executor.isTerminated()) {
            Thread.sleep(10);
        }

        assertEquals(1, successCount.get(), "Only exactly ONE request must successfully reserve the key");
        assertEquals(threads - 1, existingCount.get(), "All other concurrent requests must receive the existing processing key");
    }
}
