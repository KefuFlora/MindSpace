package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByPost_IdAndUser_Id(Long postId, Long userId);

    List<Bookmark> findByUser_IdOrderByIdDesc(Long userId);

    long countByUser_Id(Long userId);

    @Transactional
    void deleteByPost_IdAndUser_Id(Long postId, Long userId);

    @Transactional
    void deleteByPost_Id(Long postId);
}