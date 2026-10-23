package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentController(
        CommentRepository commentRepository,
        PostRepository postRepository,
        UserRepository userRepository,
        NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private Long getUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }

        return null;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Please log in to continue."));
    }

    private ResponseEntity<?> postNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "Post not found."));
    }

    private ResponseEntity<?> commentNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "Comment not found."));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(
        @PathVariable Long postId,
        @Valid @RequestBody CommentRequest request,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(postId).orElse(null);

        if (post == null) {
            return postNotFound();
        }

        User author = userRepository.findById(userId).orElse(null);

        if (author == null) {
            session.invalidate();
            return unauthorized();
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);
        notificationService.notifyComment(post, author);

        return ResponseEntity.status(HttpStatus.CREATED)
        .body(CommentResponse.from(savedComment, userId));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(
        @PathVariable Long id,
        @Valid @RequestBody CommentRequest request,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Comment comment = commentRepository.findById(id).orElse(null);

        if (comment == null) {
            return commentNotFound();
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only edit your own comments."));
        }

        comment.setContent(request.getContent().trim());

        Comment savedComment = commentRepository.save(comment);

        return ResponseEntity.ok(CommentResponse.from(savedComment, userId));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Comment comment = commentRepository.findById(id).orElse(null);

        if (comment == null) {
            return commentNotFound();
        }

        if (!comment.getAuthor().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only delete your own comments."));
        }

        commentRepository.delete(comment);

        return ResponseEntity.ok(
            Map.of("message", "Comment deleted successfully.")
        );
    }
}