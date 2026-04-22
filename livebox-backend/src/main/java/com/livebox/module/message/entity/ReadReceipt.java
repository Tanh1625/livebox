package com.livebox.module.message.entity;

import com.livebox.common.entity.BaseEntity;
import com.livebox.module.auth.entity.User;
import com.livebox.module.channel.entity.Channel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@SQLDelete(sql = "UPDATE read_receipts SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("is_deleted = false")
@Table(name = "read_receipts", uniqueConstraints = {
    @UniqueConstraint(name = "uq_receipt_user_channel", columnNames = {"user_id", "channel_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ReadReceipt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_read_message_id", nullable = true)
    private Message lastReadMessage;

    @Column(name = "receipt_updated_at", nullable = false)
    private Instant receiptUpdatedAt;

}
