package com.livebox.module.message.repository;

import com.livebox.module.message.entity.ReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * ReadReceiptRepository — SCRUM-62.
 */
@Repository
public interface ReadReceiptRepository extends JpaRepository<ReadReceipt, UUID> {

    Optional<ReadReceipt> findByUserIdAndChannelId(UUID userId, UUID channelId);

    /**
     * UPSERT: nếu đã có record thì update receiptUpdatedAt, chưa có thì insert.
     * Dùng ON CONFLICT để tránh race condition.
     */
    @Modifying
    @Query(value = """
            INSERT INTO read_receipts (id, user_id, channel_id, receipt_updated_at, is_deleted, created_at, updated_at)
            VALUES (gen_random_uuid(), :userId, :channelId, :readAt, false, NOW(), NOW())
            ON CONFLICT ON CONSTRAINT uq_receipt_user_channel
            DO UPDATE SET receipt_updated_at = EXCLUDED.receipt_updated_at, updated_at = NOW()
            """, nativeQuery = true)
    void upsertReadAt(@Param("userId") UUID userId,
                      @Param("channelId") UUID channelId,
                      @Param("readAt") Instant readAt);
}
