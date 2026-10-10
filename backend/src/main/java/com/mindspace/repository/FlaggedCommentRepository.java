package com.mindspace.repository;

import com.mindspace.model.FlaggedComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FlaggedCommentRepository
        extends JpaRepository<FlaggedComment, Long> {

    Optional<FlaggedComment> findByCommentId(String commentId);
}