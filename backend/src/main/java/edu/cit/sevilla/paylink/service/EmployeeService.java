package edu.cit.sevilla.paylink.service;

import edu.cit.sevilla.paylink.dto.CreateEmployeeRequest;
import edu.cit.sevilla.paylink.dto.EmployeeDto;
import edu.cit.sevilla.paylink.dto.UpdateEmployeeRequest;
import edu.cit.sevilla.paylink.entity.Employee;
import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.enums.EmployeeStatus;
import edu.cit.sevilla.paylink.enums.Role;
import edu.cit.sevilla.paylink.repository.EmployeeRepository;
import edu.cit.sevilla.paylink.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeDto> findAll() {
        return employeeRepository.findAll().stream().map(EmployeeDto::from).toList();
    }

    public EmployeeDto findById(Long id) {
        return employeeRepository.findById(id)
                .map(EmployeeDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }

    public EmployeeDto findByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .map(EmployeeDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Employee profile not found for user " + userId));
    }

    @Transactional
    public EmployeeDto create(CreateEmployeeRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = userRepository.save(User.builder()
                .username(req.username())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.EMPLOYEE)
                .enabled(true)
                .build());

        Employee employee = employeeRepository.save(Employee.builder()
                .user(user)
                .employeeNumber("EMP00000") // temporary; updated after ID is assigned
                .firstName(req.firstName())
                .lastName(req.lastName())
                .position(req.position())
                .department(req.department())
                .dateHired(req.dateHired())
                .basicRate(req.basicRate())
                .status(EmployeeStatus.ACTIVE)
                .build());

        employee.setEmployeeNumber("EMP" + String.format("%05d", employee.getId()));
        return EmployeeDto.from(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeDto update(Long id, UpdateEmployeeRequest req) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));

        if (req.firstName() != null)
            employee.setFirstName(req.firstName());
        if (req.lastName() != null)
            employee.setLastName(req.lastName());
        if (req.position() != null)
            employee.setPosition(req.position());
        if (req.department() != null)
            employee.setDepartment(req.department());
        if (req.dateHired() != null)
            employee.setDateHired(req.dateHired());
        if (req.basicRate() != null)
            employee.setBasicRate(req.basicRate());
        if (req.status() != null)
            employee.setStatus(req.status());

        return EmployeeDto.from(employeeRepository.save(employee));
    }
}
