package com.livebox.module.message.repository;

import com.livebox.module.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * MessageRepository — JPA Repository cho Message entity.
 *
 * <p>SCRUM-52: Hỗ trợ phân trang (Pageable) để load lịch sử tin nhắn.
 * Query sắp xếp theo createdAt DESC (tin nhắn mới nhất lên đầu).
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Tìm tất cả tin nhắn của một Channel, phân trang, sắp xếp mới nhất lên đầu.
     * Fetch sender để tránh N+1 query problem.
     */
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.sender WHERE m.channel.id = :channelId ORDER BY m.createdAt DESC")
    Page<Message> findByChannelIdOrderByCreatedAtDesc(@Param("channelId") UUID channelId, Pageable pageable);

    /**
     * SCRUM-61: Đếm số tin nhắn chưa đọc của user trong một channel.
     * since = receiptUpdatedAt của ReadReceipt (hoặc Instant.EPOCH nếu chưa đọc lần nào).
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.channel.id = :channelId AND m.createdAt > :since")
    long countUnreadSince(@Param("channelId") UUID channelId, @Param("since") java.time.Instant since);
}
