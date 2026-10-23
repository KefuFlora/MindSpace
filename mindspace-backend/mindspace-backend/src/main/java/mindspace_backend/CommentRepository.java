package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost_IdOrderByCreatedAtAsc(Long postId);

    List<Comment> findByAuthor_IdOrderByCreatedAtDesc(Long userId);

    long countByAuthor_Id(Long userId);

    @Transactional
    void deleteByPost_Id(Long postId);
}