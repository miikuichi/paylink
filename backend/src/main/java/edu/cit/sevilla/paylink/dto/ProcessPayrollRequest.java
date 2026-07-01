package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.enums.PayrollItemType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProcessPayrollRequest(
        @NotNull Long employeeId,
        @NotNull Long payPeriodId,
        List<LineItem> additionalItems) {
    public record LineItem(
            @NotNull PayrollItemType itemType,
            @NotNull String label,
            @NotNull BigDecimal amount) {
    }
}
