package mindspace_backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @NotBlank
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 250)
    private String bio;

    @Column(length = 200)
    private String interests;

    // "user", "moderator" or "admin"
    @Column(
        nullable = false,
        columnDefinition = "VARCHAR(20) NOT NULL DEFAULT 'user'"
    )
    private String role = "user";

    @Column(
        nullable = false,
        columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1"
    )
    private boolean active = true;

    // "light" or "dark" (used by the staff dashboard)
    @Column(
        nullable = false,
        columnDefinition = "VARCHAR(10) NOT NULL DEFAULT 'light'"
    )
    private String theme = "light";

    @Column(
        name = "notify_flagged",
        nullable = false,
        columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1"
    )
    private boolean notifyFlagged = true;

    @Column(
        name = "notify_system",
        nullable = false,
        columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1"
    )
    private boolean notifySystem = true;

    @Column(
        name = "notify_email",
        nullable = false,
        columnDefinition = "TINYINT(1) NOT NULL DEFAULT 0"
    )
    private boolean notifyEmail = false;

    @Column(
        name = "created_at",
        columnDefinition = "DATETIME NULL DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public boolean isNotifyFlagged() {
        return notifyFlagged;
    }

    public void setNotifyFlagged(boolean notifyFlagged) {
        this.notifyFlagged = notifyFlagged;
    }

    public boolean isNotifySystem() {
        return notifySystem;
    }

    public void setNotifySystem(boolean notifySystem) {
        this.notifySystem = notifySystem;
    }

    public boolean isNotifyEmail() {
        return notifyEmail;
    }

    public void setNotifyEmail(boolean notifyEmail) {
        this.notifyEmail = notifyEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}