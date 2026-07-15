package edu.cit.sevilla.paylink.features.holidays.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpsertHolidayRequest(
        @NotNull LocalDate holidayDate,
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Pattern(regexp = "REGULAR|SPECIAL", message = "holidayType must be REGULAR or SPECIAL") String holidayType,
        Boolean isTentative,
        Boolean isActive) {
}
