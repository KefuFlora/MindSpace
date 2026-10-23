package mindspace_backend;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
    Long id,
    String author,
    String topic,
    String content,
    LocalDateTime createdAt,
    boolean hasTriggerWarning,
    String triggerWarning,
    int likes,
    List<CommentResponse> comments,
    boolean bookmarked,
    boolean isOwnPost,
    boolean likedByCurrentUser
) {
}