package edu.cit.sevilla.paylink.features.payroll.api;

import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.features.payroll.api.request.ProcessPayrollRequest;
import edu.cit.sevilla.paylink.features.payroll.api.response.PayrollDto;
import edu.cit.sevilla.paylink.features.payroll.application.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    public List<PayrollDto> findByPayPeriod(@RequestParam(required = false) Long payPeriodId) {
        if (payPeriodId == null)
            return List.of();
        return payrollService.findByPayPeriod(payPeriodId);
    }

    @GetMapping("/me")
    public List<PayrollDto> getMyPayrolls(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return payrollService.findByEmployeeUserId(user.getId());
    }

    @GetMapping("/{id}")
    public PayrollDto findById(@PathVariable Long id) {
        return payrollService.findById(id);
    }

    @PostMapping("/process")
    public ResponseEntity<PayrollDto> process(@Valid @RequestBody ProcessPayrollRequest req,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payrollService.processPayroll(req, user.getId()));
    }
}
