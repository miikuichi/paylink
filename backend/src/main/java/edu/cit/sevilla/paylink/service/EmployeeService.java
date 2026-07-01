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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    // NCR city-rate baseline (PHP 645/day x 26 working days)
    private static final BigDecimal MIN_BASIC_RATE = new BigDecimal("16770.00");

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<EmployeeDto> findAll() {
        return employeeRepository.findAll().stream().map(EmployeeDto::from).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeDto findById(Long id) {
        return employeeRepository.findById(id)
                .map(EmployeeDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }

    @Transactional(readOnly = true)
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
                .employeeNumber("TMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .position(req.position())
                .department(req.department())
                .dateHired(req.dateHired())
                .basicRate(req.basicRate().max(MIN_BASIC_RATE))
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
            employee.setBasicRate(req.basicRate().max(MIN_BASIC_RATE));
        if (req.status() != null)
            employee.setStatus(req.status());

        return EmployeeDto.from(employeeRepository.save(employee));
    }
}
