package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PostMapper postMapper;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public PostController(
        PostRepository postRepository,
        UserRepository userRepository,
        PostLikeRepository postLikeRepository,
        CommentRepository commentRepository,
        BookmarkRepository bookmarkRepository,
        PostMapper postMapper,
        NotificationRepository notificationRepository,
        NotificationService notificationService
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.postMapper = postMapper;
        this.notificationRepository = notificationRepository;
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

    private ResponseEntity<?> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "Post not found."));
    }

    @GetMapping
    public ResponseEntity<?> getPosts(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        List<PostResponse> posts =
            postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> postMapper.toResponse(post, userId))
                .toList();

        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<?> createPost(
        @Valid @RequestBody PostRequest request,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        User author = userRepository.findById(userId).orElse(null);

        if (author == null) {
            session.invalidate();
            return unauthorized();
        }

        boolean hasWarning = request.isHasTriggerWarning();
        String warning = request.getTriggerWarning();

        if (hasWarning && (warning == null || warning.isBlank())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please enter a content warning."));
        }

        Post post = new Post();
        post.setAuthor(author);
        post.setTopic(request.getTopic());
        post.setContent(request.getContent().trim());
        post.setHasTriggerWarning(hasWarning);
        post.setTriggerWarning(hasWarning ? warning.trim() : null);
        post.setCreatedAt(LocalDateTime.now());

        Post savedPost = postRepository.save(post);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(postMapper.toResponse(savedPost, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
        @PathVariable Long id,
        @Valid @RequestBody PostRequest request,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        if (!post.getAuthor().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only edit your own posts."));
        }

        boolean hasWarning = request.isHasTriggerWarning();
        String warning = request.getTriggerWarning();

        if (hasWarning && (warning == null || warning.isBlank())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Please enter a content warning."));
        }

        post.setTopic(request.getTopic());
        post.setContent(request.getContent().trim());
        post.setHasTriggerWarning(hasWarning);
        post.setTriggerWarning(hasWarning ? warning.trim() : null);

        Post savedPost = postRepository.save(post);

        return ResponseEntity.ok(postMapper.toResponse(savedPost, userId));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            session.invalidate();
            return unauthorized();
        }

        boolean alreadyLiked =
            postLikeRepository.existsByPost_IdAndUser_Id(id, userId);

        if (!alreadyLiked) {
        postLikeRepository.save(new PostLike(post, user));
            notificationService.notifyLike(post, user);
        }

        return ResponseEntity.ok(
            postMapper.toResponse(post, userId)
        );
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        postLikeRepository.deleteByPost_IdAndUser_Id(id, userId);

        return ResponseEntity.ok(
            postMapper.toResponse(post, userId)
        );
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> bookmarkPost(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            session.invalidate();
            return unauthorized();
        }

        boolean alreadyBookmarked =
            bookmarkRepository.existsByPost_IdAndUser_Id(id, userId);

        if (!alreadyBookmarked) {
            bookmarkRepository.save(new Bookmark(post, user));
        }

        return ResponseEntity.ok(postMapper.toResponse(post, userId));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<?> unbookmarkPost(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        bookmarkRepository.deleteByPost_IdAndUser_Id(id, userId);

        return ResponseEntity.ok(postMapper.toResponse(post, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return notFound();
        }

        if (!post.getAuthor().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You can only delete your own posts."));
        }

        notificationRepository.deleteByPostId(id);
        commentRepository.deleteByPost_Id(id);
        bookmarkRepository.deleteByPost_Id(id);
        postLikeRepository.deleteByPost_Id(id);
        postRepository.delete(post);

        return ResponseEntity.ok(
            Map.of("message", "Post deleted successfully.")
        );
    }
}