package mindspace_backend;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String type,
    String title,
    String message,
    Long postId,
    LocalDateTime createdAt,
    boolean read
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getPostId(),
            notification.getCreatedAt(),
            notification.isRead()
        );
    }
}