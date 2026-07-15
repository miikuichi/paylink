package edu.cit.sevilla.paylink.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found.
 * HTTP Status: 404 NOT_FOUND
 */
public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND.value());
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(
            String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND.value()
        );
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND.value(), cause);
    }
}
