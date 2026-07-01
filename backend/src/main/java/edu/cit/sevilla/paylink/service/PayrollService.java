package edu.cit.sevilla.paylink.service;

import edu.cit.sevilla.paylink.dto.PayrollDto;
import edu.cit.sevilla.paylink.dto.ProcessPayrollRequest;
import edu.cit.sevilla.paylink.entity.*;
import edu.cit.sevilla.paylink.enums.PayrollItemType;
import edu.cit.sevilla.paylink.enums.PayrollStatus;
import edu.cit.sevilla.paylink.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final PayPeriodRepository payPeriodRepository;
    private final UserRepository userRepository;
    private final PayrollComputationService computationService;

    public List<PayrollDto> findByPayPeriod(Long payPeriodId) {
        return payrollRepository.findByPayPeriodIdOrderByCreatedAtAsc(payPeriodId)
                .stream().map(PayrollDto::from).toList();
    }

    public List<PayrollDto> findByEmployeeUserId(Long userId) {
        return payrollRepository.findByEmployeeUserId(userId)
                .stream().map(PayrollDto::from).toList();
    }

    public PayrollDto findById(Long id) {
        return payrollRepository.findById(id)
                .map(PayrollDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found: " + id));
    }

    @Transactional
    public PayrollDto processPayroll(ProcessPayrollRequest req, Long processorUserId) {
        Employee employee = employeeRepository.findById(req.employeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + req.employeeId()));
        PayPeriod period = payPeriodRepository.findById(req.payPeriodId())
                .orElseThrow(() -> new EntityNotFoundException("Pay period not found: " + req.payPeriodId()));
        User processor = userRepository.findById(processorUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + processorUserId));

        payrollRepository.findByEmployeeIdAndPayPeriodId(req.employeeId(), req.payPeriodId())
                .ifPresent(e -> {
                    throw new IllegalStateException(
                            "Payroll already exists for employee " + req.employeeId()
                                    + " in pay period " + req.payPeriodId());
                });

        // Sum additional allowances from request
        BigDecimal extraAllowances = BigDecimal.ZERO;
        BigDecimal extraDeductions = BigDecimal.ZERO;
        if (req.additionalItems() != null) {
            for (ProcessPayrollRequest.LineItem item : req.additionalItems()) {
                if (item.itemType() == PayrollItemType.ALLOWANCE) {
                    extraAllowances = extraAllowances.add(item.amount());
                } else {
                    extraDeductions = extraDeductions.add(item.amount());
                }
            }
        }

        // Gross pay = prorated basic + extra allowances
        BigDecimal grossPay = computationService.computeGrossPay(
                employee.getBasicRate(), period.getStartDate(), period.getEndDate(), extraAllowances);

        // Statutory deductions
        Map<String, BigDecimal> statutory = computationService.computeStatutoryDeductions(
                employee.getBasicRate(), period.getStartDate(), period.getEndDate());

        BigDecimal statutoryTotal = statutory.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDeductions = statutoryTotal.add(extraDeductions);
        BigDecimal netPay = grossPay.subtract(totalDeductions);

        // Persist payroll record
        Payroll payroll = payrollRepository.save(Payroll.builder()
                .employee(employee)
                .payPeriod(period)
                .grossPay(grossPay)
                .totalAllowances(extraAllowances)
                .totalDeductions(totalDeductions)
                .netPay(netPay)
                .status(PayrollStatus.PROCESSED)
                .processedBy(processor)
                .processedAt(LocalDateTime.now())
                .build());

        // Build and attach line items
        List<PayrollItem> items = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : statutory.entrySet()) {
            items.add(PayrollItem.builder()
                    .payroll(payroll)
                    .itemType(PayrollItemType.DEDUCTION)
                    .label(entry.getKey())
                    .amount(entry.getValue())
                    .build());
        }
        if (req.additionalItems() != null) {
            for (ProcessPayrollRequest.LineItem item : req.additionalItems()) {
                items.add(PayrollItem.builder()
                        .payroll(payroll)
                        .itemType(item.itemType())
                        .label(item.label())
                        .amount(item.amount())
                        .build());
            }
        }
        payroll.getItems().addAll(items);
        payroll = payrollRepository.save(payroll);

        return PayrollDto.from(payroll);
    }
}
