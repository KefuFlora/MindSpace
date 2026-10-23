package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {

    Optional<PasswordReset> findByTokenAndExpiresAtAfter(
        String token,
        LocalDateTime now
    );

    @Transactional
    void deleteByUserId(Long userId);
}