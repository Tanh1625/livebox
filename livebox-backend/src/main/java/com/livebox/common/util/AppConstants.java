package com.livebox.common.util;

/**
 * AppConstants — application-wide named constants.
 *
 * <p>Naming: SCREAMING_SNAKE_CASE per coding_conventions.md §2.
 */
public final class AppConstants {

    private AppConstants() {
        // Utility class — no instantiation
    }

    // ── Voice ────────────────────────────────────────────────────────────────
    /** C02: maximum concurrent participants per Voice Channel (WebRTC room). */
    public static final int MAX_VOICE_MEMBERS = 20;

    // ── Invite Link ──────────────────────────────────────────────────────────
    /** C06: Invite Link TTL in days. */
    public static final int INVITE_LINK_TTL_DAYS = 7;

    // ── File Upload ──────────────────────────────────────────────────────────
    /** C05: maximum avatar / server icon size in bytes (2 MB). */
    public static final long MAX_AVATAR_SIZE_BYTES = 2L * 1024 * 1024;

    // ── Pagination ──────────────────────────────────────────────────────────
    /** Default page size for paginated list endpoints. */
    public static final int DEFAULT_PAGE_SIZE = 20;

    // ── Display Name ────────────────────────────────────────────────────────
    /** G12: maximum length for a user display name. */
    public static final int DISPLAY_NAME_MAX_LENGTH = 50;
}
