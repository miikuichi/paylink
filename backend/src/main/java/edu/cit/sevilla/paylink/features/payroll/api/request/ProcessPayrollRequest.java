package edu.cit.sevilla.paylink.features.payroll.api.request;

import edu.cit.sevilla.paylink.enums.PayrollItemType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProcessPayrollRequest(
                @NotNull Long employeeId,
                @NotNull Long payPeriodId,
                @DecimalMin(value = "0", message = "Worked hours must be non-negative") BigDecimal workedHours,
                @DecimalMin(value = "0", message = "Overtime hours must be non-negative") BigDecimal overtimeHours,
                @DecimalMin(value = "0", message = "Night shift hours must be non-negative") BigDecimal nightShiftHours,
                @DecimalMin(value = "0", message = "Paid absence hours must be non-negative") BigDecimal paidAbsenceHours,
                @DecimalMin(value = "0", message = "Unpaid absence hours must be non-negative") BigDecimal unpaidAbsenceHours,
                List<LineItem> additionalItems) {
        public record LineItem(
                        @NotNull PayrollItemType itemType,
                        @NotNull String label,
                        @NotNull BigDecimal amount) {
        }
}
