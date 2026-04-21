package com.livebox.common.exception;

import org.springframework.http.HttpStatus;

/**
 * LiveBoxException — base custom runtime exception for the LiveBox domain.
 *
 * <p>Throw this (or a subclass) from any Service layer method when a
 * business rule is violated. {@link GlobalExceptionHandler} intercepts it
 * and maps it to the correct HTTP status + {@code ApiResponse} JSON body.
 *
 * <p>Usage example:
 * <pre>
 *   throw new LiveBoxException(HttpStatus.NOT_FOUND, "Server not found with id: " + id);
 * </pre>
 */
public class LiveBoxException extends RuntimeException {

    private final HttpStatus status;

    public LiveBoxException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
