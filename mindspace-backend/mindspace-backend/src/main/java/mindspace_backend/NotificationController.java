package mindspace_backend;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowCredentials = "true"
)
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
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
            .body(Map.of("message", "Notification not found."));
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        List<NotificationResponse> notifications =
            notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        return ResponseEntity.ok(Map.of(
            "count",
            notificationRepository.countByRecipient_IdAndReadFalse(userId)
        ));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        notificationRepository.markAllRead(userId);

        return ResponseEntity.ok(
            Map.of("message", "All notifications marked as read.")
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Notification notification =
            notificationRepository.findByIdAndRecipient_Id(id, userId).orElse(null);

        if (notification == null) {
            return notFound();
        }

        notification.setRead(true);

        return ResponseEntity.ok(
            NotificationResponse.from(notificationRepository.save(notification))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
        @PathVariable Long id,
        HttpSession session
    ) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        Notification notification =
            notificationRepository.findByIdAndRecipient_Id(id, userId).orElse(null);

        if (notification == null) {
            return notFound();
        }

        notificationRepository.delete(notification);

        return ResponseEntity.ok(Map.of("message", "Notification deleted."));
    }

    @DeleteMapping
    public ResponseEntity<?> clearAll(HttpSession session) {
        Long userId = getUserId(session);

        if (userId == null) {
            return unauthorized();
        }

        notificationRepository.deleteByRecipient_Id(userId);

        return ResponseEntity.ok(
            Map.of("message", "All notifications cleared.")
        );
    }
}