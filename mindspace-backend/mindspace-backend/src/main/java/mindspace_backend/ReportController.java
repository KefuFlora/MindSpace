package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class ReportController {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public ReportController(
        ReportRepository reportRepository,
        PostRepository postRepository,
        CommentRepository commentRepository,
        NotificationService notificationService
    ) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    private Long getUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");

        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }

        return null;
    }

    private ResponseEntity<?> message(HttpStatus status, String text) {
        return ResponseEntity.status(status).body(Map.of("message", text));
    }

    @PostMapping
    public ResponseEntity<?> createReport(
        @Valid @RequestBody ReportRequest request,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return message(HttpStatus.UNAUTHORIZED, "Please log in to continue.");
        }

        String type = request.getType().trim().toLowerCase();
        Long contentId = request.getId();
        String reason = request.getReason().trim();
        String details = request.getDetails() == null
            ? null
            : request.getDetails().trim();

        if (reason.isEmpty()) {
            return message(
                HttpStatus.BAD_REQUEST,
                "Please select a reason for your report."
            );
        }

        if (details != null && details.isEmpty()) {
            details = null;
        }

        Post post = null;
        Comment comment = null;

        if (type.equals("post")) {
            post = postRepository.findById(contentId).orElse(null);

            if (post == null || post.isRemoved()) {
                return message(HttpStatus.NOT_FOUND, "Post not found.");
            }

            if (post.getAuthor().getId().equals(userId)) {
                return message(
                    HttpStatus.BAD_REQUEST,
                    "You cannot report your own post."
                );
            }
        } else if (type.equals("comment")) {
            comment = commentRepository.findById(contentId).orElse(null);

            if (comment == null || "removed".equals(comment.getStatus())) {
                return message(HttpStatus.NOT_FOUND, "Comment not found.");
            }

            if (comment.getAuthor().getId().equals(userId)) {
                return message(
                    HttpStatus.BAD_REQUEST,
                    "You cannot report your own comment."
                );
            }
        } else {
            return message(
                HttpStatus.BAD_REQUEST,
                "You can only report a post or a comment."
            );
        }

        if (reportRepository.existsByContentTypeAndContentIdAndReporterId(
                type, contentId, userId)) {
            return message(
                HttpStatus.OK,
                "You have already reported this. A moderator will review it."
            );
        }

        reportRepository.save(new Report(type, contentId, userId, reason, details));

        // The first report puts the content in the moderators' queue.
        if (post != null && "approved".equals(post.getStatus())) {
            post.setStatus("flagged");
            post.setFlagReason(reason);
            postRepository.save(post);
            notificationService.notifyStaffFlagged(
                "A post was reported: " + reason + "."
            );
        }

        if (comment != null && "approved".equals(comment.getStatus())) {
            comment.setStatus("flagged");
            comment.setFlagReason(reason);
            commentRepository.save(comment);
            notificationService.notifyStaffFlagged(
                "A comment was reported: " + reason + "."
            );
        }

        return message(
            HttpStatus.CREATED,
            "Thank you. Your report has been submitted for review."
        );
    }
}