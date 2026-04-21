package com.livebox.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * ApiResponse — unified JSON wrapper for every API endpoint.
 *
 * <p>All controllers must return this type so the React client receives a
 * consistent shape:
 * <pre>
 * {
 *   "timestamp": "2026-04-21T10:00:00Z",
 *   "status":    200,
 *   "message":   "OK",
 *   "data":      { ... }
 * }
 * </pre>
 *
 * <p>The {@code data} field is omitted from the response body when {@code null}
 * (e.g. 204 No Content scenarios).
 *
 * @param <T> type of the payload carried in {@code data}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        Instant timestamp,
        int status,
        String message,
        T data
) {

    // ── Factory helpers ──────────────────────────────────────────────────────

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(Instant.now(), 200, "OK", data);
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(Instant.now(), 201, "Created", data);
    }

    public static ApiResponse<Void> noContent() {
        return new ApiResponse<>(Instant.now(), 204, "No Content", null);
    }

    public static ApiResponse<Void> error(int status, String message) {
        return new ApiResponse<>(Instant.now(), status, message, null);
    }
}
