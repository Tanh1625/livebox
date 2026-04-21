-- =========================================================================
-- LiveBox - Database Initialization Script (Optimized for PostgreSQL)
-- Generated based on LiveBox_ERD.drawio, project_context.md and BaseEntity.java
--
-- Updates:
--  - Adapted syntax and types natively for PostgreSQL.
--  - Enabled "uuid-ossp" extension and added DEFAULT uuid_generate_v4() for all IDs.
--  - Converted NVARCHAR to PostgreSQL native VARCHAR.
-- =========================================================================

-- Enable extension for generating UUIDs natively in PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. DROP EXISTING TABLES (In reverse dependency order)
-- =========================================================================
DROP TABLE IF EXISTS ban_lists;
DROP TABLE IF EXISTS read_receipts;
DROP TABLE IF EXISTS invite_codes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS servers;
DROP TABLE IF EXISTS users;

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- Table: users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP
);

-- Table: servers
CREATE TABLE servers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_server_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: channels
CREATE TABLE channels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id       UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL, -- e.g., 'TEXT' or 'VOICE'

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_channel_server FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Table: refresh_tokens
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    token_value     VARCHAR(500) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: memberships
CREATE TABLE memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    server_id       UUID NOT NULL,
    role            VARCHAR(50) NOT NULL, -- e.g., 'OWNER', 'MEMBER'
    status          VARCHAR(50) NOT NULL, -- e.g., 'ACTIVE', 'INACTIVE'
    joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_membership_server FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    CONSTRAINT uq_membership_user_server UNIQUE (user_id, server_id)
);

-- Table: messages
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id      UUID NOT NULL,
    sender_id       UUID NOT NULL,
    content         VARCHAR(2000) NOT NULL, 

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_message_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: invite_codes
CREATE TABLE invite_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id       UUID NOT NULL,
    code            VARCHAR(100) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_invitecode_server FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
);

-- Table: read_receipts
CREATE TABLE read_receipts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    channel_id      UUID NOT NULL,
    last_read_message_id UUID,

    -- ERD specific updated action
    receipt_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_readreceipt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_readreceipt_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_readreceipt_message FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    CONSTRAINT uq_receipt_user_channel UNIQUE (user_id, channel_id)
);

-- Table: ban_lists
CREATE TABLE ban_lists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id       UUID NOT NULL,
    banned_user_id  UUID NOT NULL,
    banned_by       UUID NOT NULL,
    reason          VARCHAR(500),
    banned_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BaseEntity fields
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    
    CONSTRAINT fk_banlist_server FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    CONSTRAINT fk_banlist_user FOREIGN KEY (banned_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_banlist_bannedby FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_banlist_server_user UNIQUE (server_id, banned_user_id)
);
