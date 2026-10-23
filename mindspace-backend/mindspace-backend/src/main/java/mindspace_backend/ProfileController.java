package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class ProfileController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PostMapper postMapper;

    public ProfileController(
        UserRepository userRepository,
        PostRepository postRepository,
        CommentRepository commentRepository,
        PostLikeRepository postLikeRepository,
        BookmarkRepository bookmarkRepository,
        PostMapper postMapper
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.postMapper = postMapper;
    }

    // Returns the logged-in user, or null if nobody is logged in.
    private User getCurrentUser(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (!(userId instanceof Number)) {
            return null;
        }

        User user = userRepository
            .findById(((Number) userId).longValue())
            .orElse(null);

        if (user == null) {
            session.invalidate();
        }

        return user;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Please log in to continue."));
    }

    private ProfileResponse buildProfile(User user) {
        Long id = user.getId();

        return new ProfileResponse(
            user.getUsername(),
            user.getBio(),
            user.getInterests(),
            postRepository.countByAuthor_Id(id),
            commentRepository.countByAuthor_Id(id),
            postLikeRepository.countByUser_Id(id),
            bookmarkRepository.countByUser_Id(id)
        );
    }

    // Turns blank text into null so empty fields are not stored.
    private String cleanOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }

    // Shortens long post text for the comment history.
    private String snippet(String text) {
        if (text == null) {
            return "";
        }

        return text.length() <= 120
            ? text
            : text.substring(0, 120).trim() + "...";
    }

    @GetMapping
    public ResponseEntity<?> getProfile(HttpSession session) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        return ResponseEntity.ok(buildProfile(user));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
        @Valid @RequestBody ProfileRequest request,
        HttpSession session
    ) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        String username = request.getUsername().trim();

        if (username.length() < 3 || username.length() > 30) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Username must be between 3 and 30 characters")
            );
        }

        Long userId = user.getId();

        boolean usernameTaken = userRepository.findByUsername(username)
            .filter(existing -> !existing.getId().equals(userId))
            .isPresent();

        if (usernameTaken) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Username is already taken"));
        }

        user.setUsername(username);
        user.setBio(cleanOptional(request.getBio()));
        user.setInterests(cleanOptional(request.getInterests()));

        User savedUser = userRepository.save(user);

        session.setAttribute("username", savedUser.getUsername());

        return ResponseEntity.ok(buildProfile(savedUser));
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getMyPosts(HttpSession session) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        Long userId = user.getId();

        List<PostResponse> posts =
            postRepository.findByAuthor_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(post -> postMapper.toResponse(post, userId))
                .toList();

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/comments")
    public ResponseEntity<?> getMyComments(HttpSession session) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        List<ProfileCommentResponse> comments =
            commentRepository.findByAuthor_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(comment -> new ProfileCommentResponse(
                    comment.getId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getPost().getId(),
                    snippet(comment.getPost().getContent())
                ))
                .toList();

        return ResponseEntity.ok(comments);
    }

    @GetMapping("/liked")
    public ResponseEntity<?> getLikedPosts(HttpSession session) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        Long userId = user.getId();

        List<PostResponse> posts =
            postLikeRepository.findByUser_IdOrderByIdDesc(userId)
                .stream()
                .map(like -> postMapper.toResponse(like.getPost(), userId))
                .toList();

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedPosts(HttpSession session) {
        User user = getCurrentUser(session);

        if (user == null) {
            return unauthorized();
        }

        Long userId = user.getId();

        List<PostResponse> posts =
            bookmarkRepository.findByUser_IdOrderByIdDesc(userId)
                .stream()
                .map(bookmark -> postMapper.toResponse(bookmark.getPost(), userId))
                .toList();

        return ResponseEntity.ok(posts);
    }
}