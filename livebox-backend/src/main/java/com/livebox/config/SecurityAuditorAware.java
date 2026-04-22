package com.livebox.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * SecurityAuditorAware — integrates JPA Auditing with Spring Security.
 * Extracts the user ID from the current SecurityContext.
 */
@Component
public class SecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            return Optional.of("SYSTEM");
        }

        // We passed the userId as credentials in JwtAuthenticationFilter
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String userId) {
            return Optional.of(userId);
        }

        return Optional.of(authentication.getName());
    }
}
