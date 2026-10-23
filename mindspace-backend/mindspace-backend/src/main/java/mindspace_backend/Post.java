
package mindspace_backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 50)
    private String topic;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private boolean hasTriggerWarning;

    @Column(length = 100)
    private String triggerWarning;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Post() {
    }

    public Long getId() {
        return id;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isHasTriggerWarning() {
        return hasTriggerWarning;
    }

    public void setHasTriggerWarning(boolean hasTriggerWarning) {
        this.hasTriggerWarning = hasTriggerWarning;
    }

    public String getTriggerWarning() {
        return triggerWarning;
    }

    public void setTriggerWarning(String triggerWarning) {
        this.triggerWarning = triggerWarning;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
