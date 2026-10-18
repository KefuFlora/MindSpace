package com.mindspace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flagged_comments")
public class FlaggedComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String commentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String commentContent;

    @Column(nullable = false)
    private String reportReason;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String flaggedDate;

    public FlaggedComment() {
    }

    public FlaggedComment(
            String commentId,
            String commentContent,
            String reportReason,
            String status,
            String flaggedDate) {

        this.commentId = commentId;
        this.commentContent = commentContent;
        this.reportReason = reportReason;
        this.status = status;
        this.flaggedDate = flaggedDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommentId() {
        return commentId;
    }

    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }

    public String getCommentContent() {
        return commentContent;
    }

    public void setCommentContent(String commentContent) {
        this.commentContent = commentContent;
    }

    public String getReportReason() {
        return reportReason;
    }

    public void setReportReason(String reportReason) {
        this.reportReason = reportReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFlaggedDate() {
        return flaggedDate;
    }

    public void setFlaggedDate(String flaggedDate) {
        this.flaggedDate = flaggedDate;
    }
}