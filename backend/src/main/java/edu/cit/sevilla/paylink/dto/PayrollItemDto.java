package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.entity.PayrollItem;
import edu.cit.sevilla.paylink.enums.PayrollItemType;

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
