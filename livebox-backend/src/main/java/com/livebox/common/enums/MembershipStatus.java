package com.livebox.common.enums;

/**
 * MembershipStatus — trạng thái của một Membership trong Server.
 *
 * <p>Business Rule alignment:
 * <ul>
 *   <li>{@code ACTIVE}  — Member đang hoạt động bình thường trong Server.</li>
 *   <li>{@code KICKED}  — Member đã bị Owner kick ra (G08). Có thể rejoin qua invite link mới.</li>
 *   <li>{@code BANNED}  — Member bị ban vĩnh viễn (G09, BR-06). Không thể rejoin dù có invite link.</li>
 *   <li>{@code LEFT}    — Member tự rời Server (UC-204).</li>
 * </ul>
 */
public enum MembershipStatus {
    ACTIVE,
    KICKED,
    BANNED,
    LEFT
}
