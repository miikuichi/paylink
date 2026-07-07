package edu.cit.sevilla.paylink.features.payperiods.api.response;

import edu.cit.sevilla.paylink.enums.PayPeriodStatus;
import edu.cit.sevilla.paylink.features.payperiods.domain.PayPeriod;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PayPeriodDto(
        Long id,
        LocalDate startDate,
        LocalDate endDate,
        String label,
        PayPeriodStatus status,
        LocalDateTime createdAt) {
    public static PayPeriodDto from(PayPeriod p) {
        String label = p.getStartDate() + " – " + p.getEndDate();
        return new PayPeriodDto(p.getId(), p.getStartDate(), p.getEndDate(), label, p.getStatus(), p.getCreatedAt());
    }
}
