package edu.cit.sevilla.paylink.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreatePayPeriodRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
