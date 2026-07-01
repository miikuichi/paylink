package edu.cit.sevilla.paylink.dto;

import edu.cit.sevilla.paylink.entity.Employee;
import edu.cit.sevilla.paylink.enums.EmployeeStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeDto(
        Long id,
        Long userId,
        String username,
        String email,
        String employeeNumber,
        String firstName,
        String lastName,
        String position,
        String department,
        LocalDate dateHired,
        BigDecimal basicRate,
        EmployeeStatus status,
        LocalDateTime createdAt) {
    public static EmployeeDto from(Employee e) {
        return new EmployeeDto(
                e.getId(),
                e.getUser().getId(),
                e.getUser().getUsername(),
                e.getUser().getEmail(),
                e.getEmployeeNumber(),
                e.getFirstName(),
                e.getLastName(),
                e.getPosition(),
                e.getDepartment(),
                e.getDateHired(),
                e.getBasicRate(),
                e.getStatus(),
                e.getCreatedAt());
    }
}
