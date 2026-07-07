package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.entity.Payslip;
import edu.cit.sevilla.paylink.enums.PayrollItemType;
import edu.cit.sevilla.paylink.features.payroll.api.response.PayrollItemDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PayslipDto(
        Long id,
        Long payrollId,
        Long employeeId,
        String employeeNumber,
        String employeeName,
        String position,
        String department,
        LocalDate periodStart,
        LocalDate periodEnd,
        String periodLabel,
        BigDecimal basicPay,
        BigDecimal grossPay,
        BigDecimal totalAllowances,
        BigDecimal totalDeductions,
        BigDecimal netPay,
        List<PayrollItemDto> allowances,
        List<PayrollItemDto> deductions,
        LocalDateTime issuedAt,
        String remarks) {
    public static PayslipDto from(Payslip s) {
        var payroll = s.getPayroll();
        var employee = payroll.getEmployee();
        var period = payroll.getPayPeriod();
        var allItems = payroll.getItems().stream().map(PayrollItemDto::from).toList();
        var allowanceItems = allItems.stream().filter(i -> i.itemType() == PayrollItemType.ALLOWANCE).toList();
        var deductionItems = allItems.stream().filter(i -> i.itemType() == PayrollItemType.DEDUCTION).toList();
        BigDecimal basicPay = payroll.getGrossPay().subtract(payroll.getTotalAllowances());
        String label = period.getStartDate() + " – " + period.getEndDate();

        return new PayslipDto(
                s.getId(),
                payroll.getId(),
                employee.getId(),
                employee.getEmployeeNumber(),
                employee.getFirstName() + " " + employee.getLastName(),
                employee.getPosition(),
                employee.getDepartment(),
                period.getStartDate(),
                period.getEndDate(),
                label,
                basicPay,
                payroll.getGrossPay(),
                payroll.getTotalAllowances(),
                payroll.getTotalDeductions(),
                payroll.getNetPay(),
                allowanceItems,
                deductionItems,
                s.getIssuedAt(),
                s.getRemarks());
    }
}
