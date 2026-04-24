-- =============================================================================
-- V2__full_schema.sql
-- LiveBox – Complete Schema (Phase 1)
--
-- Convention:
--   • All tables use UUID primary key (id).
--   • Shared audit columns come from BaseEntity:
--       created_at, updated_at, created_by, updated_by, is_deleted, deleted_at
--   • Soft-delete: is_deleted = true (no physical deletion in production).
--   • All foreign keys ON DELETE RESTRICT (protect audit trail).
--   • Naming: snake_case tables/columns, idx_ prefix for indexes,
--             uq_ prefix for unique constraints, fk_ prefix for foreign keys.
-- =============================================================================

-- ─── 0. Extension ─────────────────────────────────────────────────────────────
-- pgcrypto not required; Hibernate generates UUID v4 client-side.
-- Enable uuid-ossp only if you ever need gen_random_uuid() in SQL seeds.
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS
-- Entity: com.livebox.module.auth.entity.User
-- =============================================================================
CREATE TABLE users (
    id           UUID        NOT NULL DEFAULT gen_random_uuid(),
    email        VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(50)  NOT NULL,
    avatar_url   TEXT,

    -- Audit (BaseEntity)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at   TIMESTAMPTZ,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email) WHERE is_deleted = FALSE;

-- =============================================================================
-- 2. REFRESH_TOKENS
-- Entity: com.livebox.module.auth.entity.RefreshToken
-- =============================================================================
CREATE TABLE refresh_tokens (
    id           UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL,
    token_value  VARCHAR(500) NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,

    -- Audit (BaseEntity)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at   TIMESTAMPTZ,

    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_token_value UNIQUE (token_value),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id) WHERE is_deleted = FALSE;

-- =============================================================================
-- 3. SERVERS
-- Entity: com.livebox.module.server.entity.Server
-- =============================================================================
CREATE TABLE servers (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    owner_id   UUID        NOT NULL,

    -- Audit (BaseEntity)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT pk_servers PRIMARY KEY (id),
    CONSTRAINT fk_servers_owner FOREIGN KEY (owner_id)
        REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_servers_owner_id ON servers (owner_id) WHERE is_deleted = FALSE;

-- =============================================================================
-- 4. MEMBERSHIPS
-- Entity: com.livebox.module.server.entity.Membership
-- =============================================================================
CREATE TABLE memberships (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL,
    server_id  UUID        NOT NULL,
    role       VARCHAR(50)  NOT NULL,   -- e.g. OWNER, ADMIN, MEMBER
    status     VARCHAR(50)  NOT NULL,   -- e.g. ACTIVE, BANNED
    joined_at  TIMESTAMPTZ NOT NULL,

    -- Audit (BaseEntity)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT pk_memberships PRIMARY KEY (id),
    CONSTRAINT uq_membership_user_server UNIQUE (user_id, server_id),
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_memberships_server FOREIGN KEY (server_id)
        REFERENCES servers (id) ON DELETE RESTRICT
);

CREATE INDEX idx_memberships_server_id ON memberships (server_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_memberships_user_id   ON memberships (user_id)   WHERE is_deleted = FALSE;

-- =============================================================================
-- 5. INVITE_CODES
-- Entity: com.livebox.module.server.entity.InviteCode
-- =============================================================================
CREATE TABLE invite_codes (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    server_id  UUID        NOT NULL,
    code       VARCHAR(100) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    -- Audit (BaseEntity)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT pk_invite_codes PRIMARY KEY (id),
    CONSTRAINT uq_invite_codes_code UNIQUE (code),
    CONSTRAINT fk_invite_codes_server FOREIGN KEY (server_id)
        REFERENCES servers (id) ON DELETE RESTRICT
);

CREATE INDEX idx_invite_codes_server_id ON invite_codes (server_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_invite_codes_code      ON invite_codes (code)       WHERE is_deleted = FALSE;

-- =============================================================================
-- 6. BAN_LISTS
-- Entity: com.livebox.module.server.entity.BanList
-- =============================================================================
CREATE TABLE ban_lists (
    id             UUID        NOT NULL DEFAULT gen_random_uuid(),
    server_id      UUID        NOT NULL,
    banned_user_id UUID        NOT NULL,
    banned_by      UUID,                -- nullable: system ban has no actor
    reason         VARCHAR(500),
    banned_at      TIMESTAMPTZ NOT NULL,

    -- Audit (BaseEntity)
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    is_deleted     BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at     TIMESTAMPTZ,

    CONSTRAINT pk_ban_lists PRIMARY KEY (id),
    CONSTRAINT uq_banlist_server_user UNIQUE (server_id, banned_user_id),
    CONSTRAINT fk_ban_lists_server      FOREIGN KEY (server_id)      REFERENCES servers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ban_lists_banned_user FOREIGN KEY (banned_user_id) REFERENCES users   (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ban_lists_banned_by   FOREIGN KEY (banned_by)      REFERENCES users   (id) ON DELETE RESTRICT
);

CREATE INDEX idx_ban_lists_server_id ON ban_lists (server_id) WHERE is_deleted = FALSE;

-- =============================================================================
-- 7. CHANNELS
-- Entity: com.livebox.module.channel.entity.Channel
-- Enum  : com.livebox.module.channel.entity.ChannelType (TEXT | VOICE)
-- =============================================================================
CREATE TABLE channels (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    server_id  UUID        NOT NULL,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(20)  NOT NULL,   -- TEXT | VOICE (ChannelType enum)

    -- Audit (BaseEntity)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT pk_channels PRIMARY KEY (id),
    CONSTRAINT fk_channels_server FOREIGN KEY (server_id)
        REFERENCES servers (id) ON DELETE RESTRICT
);

CREATE INDEX idx_channels_server_id ON channels (server_id) WHERE is_deleted = FALSE;

-- =============================================================================
-- 8. MESSAGES
-- Entity: com.livebox.module.message.entity.Message
-- =============================================================================
CREATE TABLE messages (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    channel_id UUID         NOT NULL,
    sender_id  UUID,                    -- nullable: allows system/deleted-user messages
    content    VARCHAR(2000) NOT NULL,

    -- Audit (BaseEntity)
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT fk_messages_channel FOREIGN KEY (channel_id)
        REFERENCES channels (id) ON DELETE RESTRICT,
    CONSTRAINT fk_messages_sender  FOREIGN KEY (sender_id)
        REFERENCES users    (id) ON DELETE RESTRICT
);

-- Critical index: chat history paging — ORDER BY created_at DESC
CREATE INDEX idx_messages_channel_created ON messages (channel_id, created_at DESC) WHERE is_deleted = FALSE;

-- =============================================================================
-- 9. READ_RECEIPTS
-- Entity: com.livebox.module.message.entity.ReadReceipt
-- =============================================================================
CREATE TABLE read_receipts (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL,
    channel_id          UUID        NOT NULL,
    last_read_message_id UUID,               -- nullable: channel joined but nothing read yet
    receipt_updated_at  TIMESTAMPTZ NOT NULL,

    -- Audit (BaseEntity)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    is_deleted          BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT pk_read_receipts PRIMARY KEY (id),
    CONSTRAINT uq_receipt_user_channel UNIQUE (user_id, channel_id),
    CONSTRAINT fk_receipts_user            FOREIGN KEY (user_id)              REFERENCES users    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_receipts_channel         FOREIGN KEY (channel_id)           REFERENCES channels (id) ON DELETE RESTRICT,
    CONSTRAINT fk_receipts_last_message    FOREIGN KEY (last_read_message_id) REFERENCES messages (id) ON DELETE RESTRICT
);

CREATE INDEX idx_read_receipts_user_id ON read_receipts (user_id) WHERE is_deleted = FALSE;
