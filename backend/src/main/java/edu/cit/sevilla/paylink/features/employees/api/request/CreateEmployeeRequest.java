package edu.cit.sevilla.paylink.features.employees.api.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
                @NotBlank String username,
                @NotBlank @Email String email,
                @NotBlank @Size(min = 8) String password,
                @NotBlank String firstName,
                @NotBlank String lastName,
                String position,
                String department,
                LocalDate dateHired,
                @NotNull @DecimalMin("0") BigDecimal basicRate) {
}
