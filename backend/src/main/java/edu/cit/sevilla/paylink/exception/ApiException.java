package edu.cit.sevilla.paylink.exception;

/**
 * Base exception class for API-related errors.
 * Provides error code and HTTP status code information.
 */
public class ApiException extends RuntimeException {
    private final String errorCode;
    private final int httpStatus;

    public ApiException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public ApiException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
