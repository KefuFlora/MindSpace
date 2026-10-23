package mindspace_backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// One moderator decision (shown on the moderation history pages).
@Entity
@Table(name = "moderation_history")
public class ModerationAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "moderator_id", nullable = false)
    private Long moderatorId;

    // "post" or "comment"
    @Column(name = "content_type", nullable = false, length = 10)
    private String contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    // "approved" or "removed"
    @Column(nullable = false, length = 10)
    private String action;

    @Column(length = 255)
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ModerationAction() {
    }

    public ModerationAction(
        Long moderatorId,
        String contentType,
        Long contentId,
        String action,
        String note
    ) {
        this.moderatorId = moderatorId;
        this.contentType = contentType;
        this.contentId = contentId;
        this.action = action;
        this.note = note;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getModeratorId() {
        return moderatorId;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getContentId() {
        return contentId;
    }

    public String getAction() {
        return action;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}