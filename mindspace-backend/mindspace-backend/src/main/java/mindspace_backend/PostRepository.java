package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByAuthor_IdOrderByCreatedAtDesc(Long userId);

    long countByAuthor_Id(Long userId);
}