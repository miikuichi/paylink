package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.enums.EmployeeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateEmployeeRequest(
        String firstName,
        String lastName,
        String position,
        String department,
        LocalDate dateHired,
        BigDecimal basicRate,
        EmployeeStatus status) {
}
