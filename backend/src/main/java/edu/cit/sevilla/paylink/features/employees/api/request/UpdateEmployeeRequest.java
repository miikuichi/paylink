package edu.cit.sevilla.paylink.features.employees.api.request;

import edu.cit.sevilla.paylink.enums.EmployeeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateEmployeeRequest(
                String firstName,
                String lastName,
                String position,
                String department,
                LocalDate dateHired,
                BigDecimal basicRate,
                LocalTime shiftStart,
                LocalTime shiftEnd,
                EmployeeStatus status) {
}
