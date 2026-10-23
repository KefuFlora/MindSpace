package mindspace_backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "reports",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_report_once",
            columnNames = {"content_type", "content_id", "reporter_id"}
        )
    }
)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "post" or "comment"
    @Column(name = "content_type", nullable = false, length = 10)
    private String contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(nullable = false, length = 100)
    private String reason;

    @Column(length = 500)
    private String details;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Report() {
    }

    public Report(
        String contentType,
        Long contentId,
        Long reporterId,
        String reason,
        String details
    ) {
        this.contentType = contentType;
        this.contentId = contentId;
        this.reporterId = reporterId;
        this.reason = reason;
        this.details = details;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getContentId() {
        return contentId;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public String getReason() {
        return reason;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}