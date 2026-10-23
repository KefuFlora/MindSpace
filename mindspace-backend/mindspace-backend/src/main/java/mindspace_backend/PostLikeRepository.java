package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost_Id(Long postId);

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    List<PostLike> findByUser_IdOrderByIdDesc(Long userId);

    long countByUser_Id(Long userId);

    @Transactional
    void deleteByPost_IdAndUser_Id(Long postId, Long userId);

    @Transactional
    void deleteByPost_Id(Long postId);
}