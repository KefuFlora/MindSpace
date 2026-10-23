package mindspace_backend;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
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
        notification.setActorId(actor.getId());
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPostId(postId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        notificationRepository.save(notification);
    }
}