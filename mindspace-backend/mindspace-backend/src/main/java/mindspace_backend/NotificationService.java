package mindspace_backend;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
        NotificationRepository notificationRepository,
        UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Tells a member that a moderator acted on something they wrote.
    public void notifyModeration(User recipient, String title, String message) {
        save(recipient, null, "moderation", title, message, null);
    }

    // Tells every active moderator and admin that content needs review.
    public void notifyStaffFlagged(String message) {
        List<User> staff =
            userRepository.findByRoleInAndActiveTrue(List.of("moderator", "admin"));

        for (User member : staff) {
            if (member.isNotifyFlagged()) {
                save(member, null, "moderation", "New flagged content", message, null);
            }
        }
    }

    private String cut(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max);
    }

    // Tells a post's author that someone liked it. Never notifies yourself.
    public void notifyLike(Post post, User actor) {
        User recipient = post.getAuthor();

        if (recipient.getId().equals(actor.getId())) {
            return;
        }

        // Liking, unliking and liking again should not spam the author.
        boolean alreadyNotified =
            notificationRepository.existsByRecipient_IdAndTypeAndPostIdAndActorId(
                recipient.getId(), "like", post.getId(), actor.getId()
            );

        if (alreadyNotified) {
            return;
        }

        save(
            recipient,
            actor,
            "like",
            "Your post received support",
            "Someone appreciated a post you shared.",
            post.getId()
        );
    }

    // Tells a post's author that someone commented. Never notifies yourself.
    public void notifyComment(Post post, User actor) {
        User recipient = post.getAuthor();

        if (recipient.getId().equals(actor.getId())) {
            return;
        }

        save(
            recipient,
            actor,
            "reply",
            "Someone replied to your post",
            "Someone commented on a post you shared.",
            post.getId()
        );
    }

    private void save(
        User recipient,
        User actor,
        String type,
        String title,
        String message,
        Long postId
    ) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setActorId(actor == null ? null : actor.getId());
        notification.setType(type);
        notification.setTitle(cut(title, 120));
        notification.setMessage(cut(message, 300));
        notification.setPostId(postId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        notificationRepository.save(notification);
    }
}