package mindspace_backend;

import java.time.LocalDateTime;

public record ProfileCommentResponse(
    Long id,
    String text,
    LocalDateTime createdAt,
    Long postId,
    String postContent
) {
}