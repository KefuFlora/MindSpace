package mindspace_backend;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PostMapper {

    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final BookmarkRepository bookmarkRepository;

    public PostMapper(
        PostLikeRepository postLikeRepository,
        CommentRepository commentRepository,
        BookmarkRepository bookmarkRepository
    ) {
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    public PostResponse toResponse(Post post, Long currentUserId) {
        boolean ownPost = post.getAuthor().getId().equals(currentUserId);

        int likeCount = Math.toIntExact(
            postLikeRepository.countByPost_Id(post.getId())
        );

        boolean liked = postLikeRepository.existsByPost_IdAndUser_Id(
            post.getId(),
            currentUserId
        );

        boolean bookmarked = bookmarkRepository.existsByPost_IdAndUser_Id(
            post.getId(),
            currentUserId
        );

        List<CommentResponse> comments =
            commentRepository.findByPost_IdOrderByCreatedAtAsc(post.getId())
                .stream()
                .map(comment -> CommentResponse.from(comment, currentUserId))
                .toList();

        return new PostResponse(
            post.getId(),
            post.getAuthor().getUsername(),
            post.getTopic(),
            post.getContent(),
            post.getCreatedAt(),
            post.isHasTriggerWarning(),
            post.getTriggerWarning(),
            likeCount,
            comments,
            bookmarked,
            ownPost,
            liked
        );
    }
}