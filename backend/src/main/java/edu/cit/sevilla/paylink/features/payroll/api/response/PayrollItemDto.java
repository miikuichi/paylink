package edu.cit.sevilla.paylink.features.payroll.api.response;

import edu.cit.sevilla.paylink.enums.PayrollItemType;
import edu.cit.sevilla.paylink.features.payroll.domain.PayrollItem;

import java.math.BigDecimal;

public record PayrollItemDto(
        Long id,
        PayrollItemType itemType,
        String label,
        BigDecimal amount) {
    public static PayrollItemDto from(PayrollItem i) {
        return new PayrollItemDto(i.getId(), i.getItemType(), i.getLabel(), i.getAmount());
    }
}
