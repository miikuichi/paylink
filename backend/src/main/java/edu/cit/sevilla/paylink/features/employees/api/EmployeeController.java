package edu.cit.sevilla.paylink.features.employees.api;

import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.features.employees.api.request.CreateEmployeeRequest;
import edu.cit.sevilla.paylink.features.employees.api.request.UpdateEmployeeRequest;
import edu.cit.sevilla.paylink.features.employees.api.response.EmployeeDto;
import edu.cit.sevilla.paylink.features.employees.application.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeDto> findAll() {
        return employeeService.findAll();
    }

    @GetMapping("/me")
    public EmployeeDto getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return employeeService.findByUserId(user.getId());
    }

    @GetMapping("/{id}")
    public EmployeeDto findById(@PathVariable Long id) {
        return employeeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<EmployeeDto> create(@Valid @RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(req));
    }    @PutMapping("/{id}")
    public EmployeeDto update(@PathVariable Long id, @Valid @RequestBody UpdateEmployeeRequest req) {
        return employeeService.update(id, req);
    }
}
