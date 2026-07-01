package edu.cit.sevilla.paylink.common;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors
) {
    public ApiError(int status, String error, String message) {
        this(LocalDateTime.now(), status, error, message, null);
    }

    public ApiError(int status, String error, String message, Map<String, String> fieldErrors) {
        this(LocalDateTime.now(), status, error, message, fieldErrors);
    }
}
