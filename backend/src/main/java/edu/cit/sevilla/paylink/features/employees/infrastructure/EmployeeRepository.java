package edu.cit.sevilla.paylink.features.employees.infrastructure;

import edu.cit.sevilla.paylink.features.employees.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUserId(Long userId);

    boolean existsByEmployeeNumber(String employeeNumber);
}
