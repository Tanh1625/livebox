package com.livebox.common.enums;

/**
 * MemberRole — role of a user within a specific Server.
 *
 * <p>Glossary ref: G05 (Server Owner), G06 (Member).
 *
 * <ul>
 *   <li>{@code OWNER} — created the server; has full administrative privileges.</li>
 *   <li>{@code MEMBER} — joined via Invite Link; can chat and join voice channels.</li>
 * </ul>
 */
public enum MemberRole {
    OWNER,
    MEMBER
}
