package edu.cit.sevilla.paylink.features.payroll.application;

import edu.cit.sevilla.paylink.enums.PayrollItemType;
import edu.cit.sevilla.paylink.enums.PayrollStatus;
import edu.cit.sevilla.paylink.features.employees.domain.Employee;
import edu.cit.sevilla.paylink.features.employees.infrastructure.EmployeeRepository;
import edu.cit.sevilla.paylink.features.payperiods.domain.PayPeriod;
import edu.cit.sevilla.paylink.features.payperiods.infrastructure.PayPeriodRepository;
import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.features.payroll.api.request.ProcessPayrollRequest;
import edu.cit.sevilla.paylink.features.payroll.api.response.PayrollDto;
import edu.cit.sevilla.paylink.features.payroll.domain.Payroll;
import edu.cit.sevilla.paylink.features.payroll.domain.PayrollItem;
import edu.cit.sevilla.paylink.features.payroll.infrastructure.PayrollRepository;
import edu.cit.sevilla.paylink.repository.UserRepository;
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

        @Transactional(readOnly = true)
        public List<PayrollDto> findByPayPeriod(Long payPeriodId) {
                return payrollRepository.findByPayPeriodIdOrderByCreatedAtAsc(payPeriodId)
                                .stream().map(PayrollDto::from).toList();
        }

        @Transactional(readOnly = true)
        public List<PayrollDto> findByEmployeeUserId(Long userId) {
                return payrollRepository.findByEmployeeUserId(userId)
                                .stream().map(PayrollDto::from).toList();
        }

        @Transactional(readOnly = true)
        public PayrollDto findById(Long id) {
                return payrollRepository.findById(id)
                                .map(PayrollDto::from)
                                .orElseThrow(() -> new EntityNotFoundException("Payroll not found: " + id));
        }

        @Transactional
        public PayrollDto processPayroll(ProcessPayrollRequest req, Long processorUserId) {
                Employee employee = employeeRepository.findById(req.employeeId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Employee not found: " + req.employeeId()));
                PayPeriod period = payPeriodRepository.findById(req.payPeriodId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Pay period not found: " + req.payPeriodId()));
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

                BigDecimal workedHours = req.workedHours() != null ? req.workedHours() : BigDecimal.ZERO;
                BigDecimal overtimeHours = req.overtimeHours() != null ? req.overtimeHours() : BigDecimal.ZERO;
                BigDecimal nightShiftHours = req.nightShiftHours() != null ? req.nightShiftHours() : BigDecimal.ZERO;
                BigDecimal paidAbsenceHours = req.paidAbsenceHours() != null ? req.paidAbsenceHours() : BigDecimal.ZERO;
                BigDecimal unpaidAbsenceHours = req.unpaidAbsenceHours() != null ? req.unpaidAbsenceHours()
                                : BigDecimal.ZERO;

                boolean usesHourInputs = req.workedHours() != null || req.overtimeHours() != null
                                || req.nightShiftHours() != null || req.paidAbsenceHours() != null
                                || req.unpaidAbsenceHours() != null;

                BigDecimal grossPay;
                if (usesHourInputs) {
                        BigDecimal payableRegularHours = workedHours
                                        .add(paidAbsenceHours)
                                        .subtract(unpaidAbsenceHours);
                        if (payableRegularHours.compareTo(BigDecimal.ZERO) < 0) {
                                payableRegularHours = BigDecimal.ZERO;
                        }

                        BigDecimal hourlyRate = employee.getBasicRate()
                                        .divide(PayrollConfiguration.HOURS_PER_MONTH, 10,
                                                        java.math.RoundingMode.HALF_UP);
                        BigDecimal nightDifferential = computationService.computeNightDifferential(hourlyRate,
                                        nightShiftHours);

                        grossPay = computationService.computeGrossPayWithOvertime(
                                        employee.getBasicRate(),
                                        payableRegularHours,
                                        overtimeHours,
                                        extraAllowances)
                                        .add(nightDifferential)
                                        .setScale(2, java.math.RoundingMode.HALF_UP);
                } else {
                        // Gross pay = prorated basic + extra allowances
                        grossPay = computationService.computeGrossPay(
                                        employee.getBasicRate(), period.getStartDate(), period.getEndDate(),
                                        extraAllowances);
                }

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
