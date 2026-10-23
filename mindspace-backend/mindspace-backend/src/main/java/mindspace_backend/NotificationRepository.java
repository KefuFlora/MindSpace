package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long userId);

    Optional<Notification> findByIdAndRecipient_Id(Long id, Long userId);

    long countByRecipient_IdAndReadFalse(Long userId);

    boolean existsByRecipient_IdAndTypeAndPostIdAndActorId(
        Long recipientId,
        String type,
        Long postId,
        Long actorId
    );

    @Modifying
    @Transactional
    @Query("update Notification n set n.read = true "
        + "where n.recipient.id = :userId and n.read = false")
    int markAllRead(@Param("userId") Long userId);

    @Transactional
    void deleteByRecipient_Id(Long userId);

    @Transactional
    void deleteByPostId(Long postId);
}