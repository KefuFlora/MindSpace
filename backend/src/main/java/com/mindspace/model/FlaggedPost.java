package com.mindspace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flagged_posts")
public class FlaggedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String postId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String postContent;

    @Column(nullable = false)
    private String reportReason;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String flaggedDate;

    public FlaggedPost() {
    }

    public FlaggedPost(
            String postId,
            String postContent,
            String reportReason,
            String status,
            String flaggedDate) {

        this.postId = postId;
        this.postContent = postContent;
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

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getPostContent() {
        return postContent;
    }

    public void setPostContent(String postContent) {
        this.postContent = postContent;
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