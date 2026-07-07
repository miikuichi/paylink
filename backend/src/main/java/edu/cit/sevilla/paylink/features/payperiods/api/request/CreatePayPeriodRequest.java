package edu.cit.sevilla.paylink.features.payperiods.api.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreatePayPeriodRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
