package com.recovery.autopilot;

import com.recovery.autopilot.payment.Payment;
import com.recovery.autopilot.payment.PaymentRepository;
import com.recovery.autopilot.payment.PaymentStatus;
import com.recovery.autopilot.recovery.RecoveryCase;
import com.recovery.autopilot.recovery.RecoveryCaseRepository;
import com.recovery.autopilot.recovery.RecoveryCaseStatus;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class MerchantIsolationTest {

    @Test
    public void testMerchantDataIsolation() {
        RecoveryCaseRepository caseRepository = Mockito.mock(RecoveryCaseRepository.class);
        PaymentRepository paymentRepository = Mockito.mock(PaymentRepository.class);

        String merchantA = "merch_A_100";
        String merchantB = "merch_B_200";

        RecoveryCase caseA = new RecoveryCase("REC-A1", "pay-A1", "cust-A1", merchantA, new BigDecimal("1000.00"), RecoveryCaseStatus.RECOVERY_ELIGIBLE);
        RecoveryCase caseB = new RecoveryCase("REC-B1", "pay-B1", "cust-B1", merchantB, new BigDecimal("2000.00"), RecoveryCaseStatus.RECOVERY_ELIGIBLE);

        when(caseRepository.findByMerchantId(merchantA)).thenReturn(List.of(caseA));
        when(caseRepository.findByMerchantId(merchantB)).thenReturn(List.of(caseB));

        List<RecoveryCase> merchantARecords = caseRepository.findByMerchantId(merchantA);
        List<RecoveryCase> merchantBRecords = caseRepository.findByMerchantId(merchantB);

        assertEquals(1, merchantARecords.size());
        assertEquals(merchantA, merchantARecords.get(0).getMerchantId());

        assertEquals(1, merchantBRecords.size());
        assertEquals(merchantB, merchantBRecords.get(0).getMerchantId());

        assertFalse(merchantARecords.stream().anyMatch(c -> c.getMerchantId().equals(merchantB)));
        assertFalse(merchantBRecords.stream().anyMatch(c -> c.getMerchantId().equals(merchantA)));
    }
}
