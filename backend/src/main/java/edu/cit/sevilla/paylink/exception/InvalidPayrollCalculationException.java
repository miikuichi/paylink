package edu.cit.sevilla.paylink.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when payroll calculation fails or produces invalid results.
 * HTTP Status: 422 UNPROCESSABLE_ENTITY
 */
public class InvalidPayrollCalculationException extends ApiException {
    public InvalidPayrollCalculationException(String message) {
        super(message, "INVALID_PAYROLL_CALCULATION", HttpStatus.UNPROCESSABLE_ENTITY.value());
    }

    public InvalidPayrollCalculationException(String message, Throwable cause) {
        super(message, "INVALID_PAYROLL_CALCULATION", HttpStatus.UNPROCESSABLE_ENTITY.value(), cause);
    }

    public InvalidPayrollCalculationException(String field, String reason) {
        super(
            String.format("Invalid payroll calculation for %s: %s", field, reason),
            "INVALID_PAYROLL_CALCULATION",
            HttpStatus.UNPROCESSABLE_ENTITY.value()
        );
    }
}
