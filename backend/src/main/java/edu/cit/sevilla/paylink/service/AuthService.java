package edu.cit.sevilla.paylink.service;

import edu.cit.sevilla.paylink.dto.AuthResponse;
import edu.cit.sevilla.paylink.dto.LoginRequest;
import edu.cit.sevilla.paylink.dto.RegisterRequest;
import edu.cit.sevilla.paylink.entity.Employee;
import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.enums.EmployeeStatus;
import edu.cit.sevilla.paylink.enums.Role;
import edu.cit.sevilla.paylink.repository.EmployeeRepository;
import edu.cit.sevilla.paylink.repository.UserRepository;
import edu.cit.sevilla.paylink.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    // NCR city-rate baseline (PHP 645/day x 26 working days)
    private static final BigDecimal MIN_BASIC_RATE = new BigDecimal("16770.00");

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role requestedRole = request.role() == Role.ADMIN ? Role.ADMIN : Role.EMPLOYEE;

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(requestedRole)
                .enabled(true)
                .build();

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Username or email is already registered");
        }

        // Business Rule 5: every employee profile must be linked to a valid user
        // account.
        Employee employee = Employee.builder()
                .user(user)
                .employeeNumber("TMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .basicRate(MIN_BASIC_RATE)
                .status(EmployeeStatus.ACTIVE)
                .build();
        employee = employeeRepository.save(employee);

        // Generate a human-readable employee number now that the id is known.
        employee.setEmployeeNumber("EMP" + String.format("%05d", employee.getId()));
        employeeRepository.save(employee);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
