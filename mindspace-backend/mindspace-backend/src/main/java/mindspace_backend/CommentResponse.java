package mindspace_backend;

import java.time.LocalDateTime;

public record CommentResponse(
    Long id,
    String author,
    String text,
    LocalDateTime createdAt,
    boolean isOwnComment
) {
    public static CommentResponse from(Comment comment, Long currentUserId) {
        return new CommentResponse(
            comment.getId(),
            comment.getAuthor().getUsername(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getAuthor().getId().equals(currentUserId)
        );
    }
}