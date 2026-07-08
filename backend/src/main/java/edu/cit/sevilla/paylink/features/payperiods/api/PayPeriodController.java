package edu.cit.sevilla.paylink.features.payperiods.api;

import edu.cit.sevilla.paylink.enums.PayPeriodStatus;
import edu.cit.sevilla.paylink.features.payperiods.api.request.CreatePayPeriodRequest;
import edu.cit.sevilla.paylink.features.payperiods.api.response.PayPeriodDto;
import edu.cit.sevilla.paylink.features.payperiods.application.PayPeriodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pay-periods")
@RequiredArgsConstructor
public class PayPeriodController {

    private final PayPeriodService payPeriodService;

    @GetMapping
    public List<PayPeriodDto> findAll() {
        return payPeriodService.findAll();
    }

    @GetMapping("/{id}")
    public PayPeriodDto findById(@PathVariable Long id) {
        return payPeriodService.findById(id);
    }

    @PostMapping
    public ResponseEntity<PayPeriodDto> create(@Valid @RequestBody CreatePayPeriodRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payPeriodService.create(req));
    }

    @PatchMapping("/{id}/status")
    public PayPeriodDto updateStatus(@PathVariable Long id, @RequestParam PayPeriodStatus status) {
        return payPeriodService.updateStatus(id, status);
    }
}
