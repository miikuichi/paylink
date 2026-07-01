package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.entity.Payroll;
import edu.cit.sevilla.paylink.enums.PayrollStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PayrollDto(
        Long id,
        Long employeeId,
        String employeeNumber,
        String employeeName,
        Long payPeriodId,
        String payPeriodLabel,
        BigDecimal basicPay,
        BigDecimal grossPay,
        BigDecimal totalAllowances,
        BigDecimal totalDeductions,
        BigDecimal netPay,
        PayrollStatus status,
        LocalDateTime processedAt,
        List<PayrollItemDto> items,
        boolean hasPayslip) {
    public static PayrollDto from(Payroll p) {
        BigDecimal basicPay = p.getGrossPay().subtract(p.getTotalAllowances());
        String periodLabel = p.getPayPeriod().getStartDate() + " – " + p.getPayPeriod().getEndDate();
        return new PayrollDto(
                p.getId(),
                p.getEmployee().getId(),
                p.getEmployee().getEmployeeNumber(),
                p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName(),
                p.getPayPeriod().getId(),
                periodLabel,
                basicPay,
                p.getGrossPay(),
                p.getTotalAllowances(),
                p.getTotalDeductions(),
                p.getNetPay(),
                p.getStatus(),
                p.getProcessedAt(),
                p.getItems().stream().map(PayrollItemDto::from).toList(),
                p.getPayslip() != null);
    }
}
