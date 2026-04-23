package com.livebox.module.message.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.module.auth.entity.User;
import com.livebox.module.channel.entity.Channel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Message — Entity đại diện cho một tin nhắn text trong một Text Channel.
 *
 * <p>Một Message thuộc về một Channel và được gửi bởi một User (sender).
 * Soft Delete: record không bị xoá khỏi DB, chỉ đánh dấu is_deleted = true
 * để bảo toàn lịch sử chat.
 */
@Entity
@SQLDelete(sql = "UPDATE messages SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = true)
    private User sender;

    @Column(name = "content", nullable = false, length = 2000)
    private String content;
}
