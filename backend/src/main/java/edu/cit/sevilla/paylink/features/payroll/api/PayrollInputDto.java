package edu.cit.sevilla.paylink.features.payroll.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for payroll computation input parameters
 * Accepts hours worked, holidays, overtime, and other payroll variables
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollInputDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Monthly basic rate is required")
    @Min(value = 0, message = "Monthly basic rate must be non-negative")
    private BigDecimal monthlyBasicRate;

    @NotNull(message = "Pay period start date is required")
    private LocalDate payPeriodStart;

    @NotNull(message = "Pay period end date is required")
    private LocalDate payPeriodEnd;

    // ==================== HOURS WORKED ====================
    @NotNull(message = "Regular hours worked is required")
    @Min(value = 0, message = "Regular hours worked must be non-negative")
    private BigDecimal regularHoursWorked;

    @Min(value = 0, message = "Overtime hours must be non-negative")
    private BigDecimal overtimeHours;

    @Min(value = 0, message = "Night shift hours must be non-negative")
    private BigDecimal nightShiftHours;

    // ==================== HOLIDAYS ====================
    @Min(value = 0, message = "Regular holidays worked must be non-negative")
    private Integer regularHolidaysWorked;

    @Min(value = 0, message = "Special holidays worked must be non-negative")
    private Integer specialHolidaysWorked;

    @Min(value = 0, message = "Regular holidays not worked must be non-negative")
    private Integer regularHolidaysNotWorked;

    @Min(value = 0, message = "Special holidays not worked must be non-negative")
    private Integer specialHolidaysNotWorked;

    // ==================== REST DAYS ====================
    @Min(value = 0, message = "Rest days worked must be non-negative")
    private Integer restDaysWorked;

    // ==================== ALLOWANCES & DEDUCTIONS ====================
    @Min(value = 0, message = "Additional allowances must be non-negative")
    private BigDecimal additionalAllowances;

    @Min(value = 0, message = "Other deductions must be non-negative")
    private BigDecimal otherDeductions;

    // ==================== NOTES ====================
    private String remarks;

    // Default constructor with basic fields
    public PayrollInputDto(Long employeeId, BigDecimal monthlyBasicRate, LocalDate payPeriodStart,
                          LocalDate payPeriodEnd, BigDecimal regularHoursWorked) {
        this.employeeId = employeeId;
        this.monthlyBasicRate = monthlyBasicRate;
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
        this.regularHoursWorked = regularHoursWorked;
        this.overtimeHours = BigDecimal.ZERO;
        this.nightShiftHours = BigDecimal.ZERO;
        this.regularHolidaysWorked = 0;
        this.specialHolidaysWorked = 0;
        this.regularHolidaysNotWorked = 0;
        this.specialHolidaysNotWorked = 0;
        this.restDaysWorked = 0;
        this.additionalAllowances = BigDecimal.ZERO;
        this.otherDeductions = BigDecimal.ZERO;
    }
}
