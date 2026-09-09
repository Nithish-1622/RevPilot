package com.recovery.autopilot.customer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerIntelligenceService customerIntelligenceService;

    public CustomerController(CustomerIntelligenceService customerIntelligenceService) {
        this.customerIntelligenceService = customerIntelligenceService;
    }

    @GetMapping("/{customerId}/recovery-profile")
    public ResponseEntity<CustomerProfileDTO> getCustomerRecoveryProfile(@PathVariable String customerId) {
        CustomerProfileDTO profile = customerIntelligenceService.getCustomerProfile(customerId);
        return ResponseEntity.ok(profile);
    }
}
