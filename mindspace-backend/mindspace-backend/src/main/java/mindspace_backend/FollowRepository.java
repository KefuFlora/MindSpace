package mindspace_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollower_IdAndFollowed_Id(Long followerId, Long followedId);

    List<Follow> findByFollower_Id(Long followerId);

    @Transactional
    void deleteByFollower_IdAndFollowed_Id(Long followerId, Long followedId);
}