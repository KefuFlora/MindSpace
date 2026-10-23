package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class FollowController {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowController(
        FollowRepository followRepository,
        UserRepository userRepository
    ) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
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

    // Usernames of everyone the logged-in user follows.
    @GetMapping
    public ResponseEntity<?> getFollowing(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        List<String> usernames = followRepository.findByFollower_Id(userId)
            .stream()
            .map(follow -> follow.getFollowed().getUsername())
            .toList();

        return ResponseEntity.ok(usernames);
    }

    @PostMapping("/{username}")
    public ResponseEntity<?> follow(
        @PathVariable String username,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        User follower = userRepository.findById(userId).orElse(null);

        if (follower == null) {
            session.invalidate();
            return unauthorized();
        }

        User target = userRepository.findByUsername(username).orElse(null);

        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found."));
        }

        if (target.getId().equals(userId)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "You cannot follow yourself."));
        }

        if (!followRepository.existsByFollower_IdAndFollowed_Id(
                userId, target.getId())) {
            followRepository.save(new Follow(follower, target));
        }

        return ResponseEntity.ok(Map.of("message", "Followed."));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> unfollow(
        @PathVariable String username,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        User target = userRepository.findByUsername(username).orElse(null);

        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found."));
        }

        followRepository.deleteByFollower_IdAndFollowed_Id(userId, target.getId());

        return ResponseEntity.ok(Map.of("message", "Unfollowed."));
    }
}