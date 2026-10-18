package com.mindspace.repository;

import com.mindspace.model.FlaggedPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FlaggedPostRepository extends JpaRepository<FlaggedPost, Long> {

    Optional<FlaggedPost> findByPostId(String postId);
}