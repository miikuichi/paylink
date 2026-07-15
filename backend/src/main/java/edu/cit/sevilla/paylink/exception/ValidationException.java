package edu.cit.sevilla.paylink.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when request validation fails.
 * HTTP Status: 400 BAD_REQUEST
 */
public class ValidationException extends ApiException {
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST.value());
    }

    public ValidationException(String message, Throwable cause) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST.value(), cause);
    }
}
