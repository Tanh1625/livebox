package com.livebox.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * Get the current user ID from the SecurityContext.
     * In JwtAuthenticationFilter, we store the userId (UUID string) as credentials.
     *
     * @return UUID of the current user
     * @throws IllegalStateException if the user is not authenticated or userId is missing
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        Object credentials = authentication.getCredentials();
        if (credentials instanceof String userIdStr) {
            try {
                return UUID.fromString(userIdStr);
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException("Invalid user ID format in SecurityContext", e);
            }
        }

        // Fallback or if credentials is not a string (should not happen with our JwtAuthenticationFilter)
        throw new IllegalStateException("User ID not found in SecurityContext credentials");
    }
}
