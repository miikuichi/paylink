package edu.cit.sevilla.paylink.controller;

import edu.cit.sevilla.paylink.dto.PayslipDto;
import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.service.PayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payslips")
@RequiredArgsConstructor
public class PayslipController {

    private final PayslipService payslipService;

    @GetMapping("/me")
    public List<PayslipDto> getMyPayslips(@AuthenticationPrincipal User user) {
        return payslipService.findByEmployeeUserId(user.getId());
    }

    @GetMapping
    public List<PayslipDto> findByPayPeriod(@RequestParam(required = false) Long payPeriodId) {
        if (payPeriodId == null)
            return List.of();
        return payslipService.findByPayPeriod(payPeriodId);
    }

    @GetMapping("/{id}")
    public PayslipDto findById(@PathVariable Long id) {
        return payslipService.findById(id);
    }

    @PostMapping("/generate/{payrollId}")
    public ResponseEntity<PayslipDto> generate(@PathVariable Long payrollId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payslipService.generate(payrollId));
    }
}
