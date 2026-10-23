package mindspace_backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Moderator tools (admins can use them too).
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class StaffModerationController {

    private final JdbcTemplate db;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public StaffModerationController(
        JdbcTemplate db,
        PostRepository postRepository,
        CommentRepository commentRepository,
        ReportRepository reportRepository,
        ModerationActionRepository moderationActionRepository,
        NotificationRepository notificationRepository,
        NotificationService notificationService,
        AuditService auditService
    ) {
        this.db = db;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.moderationActionRepository = moderationActionRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @GetMapping("/flagged")
    public List<Map<String, Object>> flagged(
        @RequestParam(defaultValue = "posts") String type
    ) {
        // Only these two table names are ever used.
        String table = type.equals("comments") ? "comments" : "posts";

        return db.queryForList(
            "SELECT c.id, c.content, c.flag_reason, c.created_at, "
                + "u.username AS author FROM " + table + " c "
                + "JOIN users u ON u.id = c.user_id "
                + "WHERE c.status = 'flagged' ORDER BY c.created_at DESC");
    }

    @PostMapping("/review")
    public Map<String, Object> review(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, Object> body
    ) {
        String type = StaffSupport.text(body.get("type"));
        String action = StaffSupport.text(body.get("action"));

        if (!List.of("post", "comment").contains(type)
                || !List.of("approved", "removed").contains(action)
                || !(body.get("id") instanceof Number)) {
            throw new ApiException(400, "Bad request.");
        }

        Long id = ((Number) body.get("id")).longValue();
        String note = StaffSupport.text(body.get("note")).trim();

        if (note.length() > 255) {
            note = note.substring(0, 255);
        }

        User author;

        if (type.equals("post")) {
            Post post = postRepository.findById(id).orElse(null);

            if (post == null) {
                throw new ApiException(404, "Post not found.");
            }

            post.setStatus(action);
            postRepository.save(post);
            author = post.getAuthor();
        } else {
            Comment comment = commentRepository.findById(id).orElse(null);

            if (comment == null) {
                throw new ApiException(404, "Comment not found.");
            }

            comment.setStatus(action);
            commentRepository.save(comment);
            author = comment.getAuthor();
        }

        moderationActionRepository.save(new ModerationAction(
            me.getId(), type, id, action, note.isEmpty() ? null : note
        ));

        // The reports are resolved, so the content can be reported again later.
        reportRepository.deleteByContentTypeAndContentId(type, id);

        auditService.log(me.getId(), "review_" + action, type + " #" + id);

        if (action.equals("removed")) {
            String message = "A moderator removed your " + type
                + " because it did not meet the MindSpace community guidelines.";

            if (!note.isEmpty()) {
                message += " Moderator note: " + note;
            }

            notificationService.notifyModeration(
                author,
                "Your " + type + " was removed",
                message
            );
        }

        return Map.of("ok", true);
    }

     @GetMapping("/history")
    public List<Map<String, Object>> history(
        @RequestParam(required = false) Long moderator
    ) {
        String sql =
            "SELECT h.id, h.moderator_id, h.content_type, h.content_id, "
                + "h.action, h.note, h.created_at, u.username AS moderator "
                + "FROM moderation_history h "
                + "LEFT JOIN users u ON u.id = h.moderator_id "
                + (moderator == null ? "" : "WHERE h.moderator_id = ? ")
                + "ORDER BY h.created_at DESC, h.id DESC LIMIT 200";

        return moderator == null
            ? db.queryForList(sql)
            : db.queryForList(sql, moderator);
    }

    // Administrators only: how each moderator is doing.
    @GetMapping("/moderators")
    public List<Map<String, Object>> moderators() {
        return db.queryForList(
            "SELECT u.id, u.username AS name, u.email, u.active, "
                + "COUNT(h.id) AS total, "
                + "COALESCE(SUM(h.action = 'approved'), 0) AS approved, "
                + "COALESCE(SUM(h.action = 'removed'), 0) AS removed, "
                + "MAX(h.created_at) AS last_action "
                + "FROM users u "
                + "LEFT JOIN moderation_history h ON h.moderator_id = u.id "
                + "WHERE u.role = 'moderator' "
                + "GROUP BY u.id, u.username, u.email, u.active "
                + "ORDER BY u.username");
    }

    // Administrators only: put a removed post or comment back.
    @PostMapping("/reverse")
    public Map<String, Object> reverse(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, Object> body
    ) {
        String type = StaffSupport.text(body.get("type"));

        if (!List.of("post", "comment").contains(type)
                || !(body.get("id") instanceof Number)) {
            throw new ApiException(400, "Bad request.");
        }

        Long id = ((Number) body.get("id")).longValue();
        User author;

        if (type.equals("post")) {
            Post post = postRepository.findById(id).orElse(null);

            if (post == null) {
                throw new ApiException(404, "Post not found.");
            }

            if (!post.isRemoved()) {
                throw new ApiException(400, "That post is not removed right now.");
            }

            post.setStatus("approved");
            post.setFlagReason(null);
            postRepository.save(post);
            author = post.getAuthor();
        } else {
            Comment comment = commentRepository.findById(id).orElse(null);

            if (comment == null) {
                throw new ApiException(404, "Comment not found.");
            }

            if (!"removed".equals(comment.getStatus())) {
                throw new ApiException(400, "That comment is not removed right now.");
            }

            comment.setStatus("approved");
            comment.setFlagReason(null);
            commentRepository.save(comment);
            author = comment.getAuthor();
        }

        moderationActionRepository.save(new ModerationAction(
            me.getId(), type, id, "approved", "Restored by an administrator"
        ));

        auditService.log(me.getId(), "review_reversed", type + " #" + id);

        notificationService.notifyModeration(
            author,
            "Your " + type + " was restored",
            "An administrator reviewed your " + type + " and restored it."
        );

        return Map.of("ok", true);
    }
    
    @GetMapping("/notifications")
    public List<Map<String, Object>> notifications(
        @RequestAttribute("user") User me
    ) {
        return db.queryForList(
            "SELECT id, title, message, is_read, created_at FROM notifications "
                + "WHERE recipient_id = ? ORDER BY created_at DESC, id DESC LIMIT 50",
            me.getId());
    }

    @PostMapping("/notifications/read")
    public Map<String, Object> markRead(@RequestAttribute("user") User me) {
        notificationRepository.markAllRead(me.getId());
        return Map.of("ok", true);
    }
}