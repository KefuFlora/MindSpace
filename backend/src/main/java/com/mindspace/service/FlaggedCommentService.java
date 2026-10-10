package com.mindspace.service;

import com.mindspace.model.FlaggedComment;
import com.mindspace.repository.FlaggedCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FlaggedCommentService {

    private final FlaggedCommentRepository flaggedCommentRepository;

    public FlaggedCommentService(
            FlaggedCommentRepository flaggedCommentRepository) {

        this.flaggedCommentRepository = flaggedCommentRepository;
    }

    public List<FlaggedComment> getAllFlaggedComments() {
        return flaggedCommentRepository.findAll();
    }

    public Optional<FlaggedComment> getFlaggedCommentById(Long id) {
        return flaggedCommentRepository.findById(id);
    }

    public Optional<FlaggedComment> getFlaggedCommentByCommentId(
            String commentId) {

        return flaggedCommentRepository.findByCommentId(commentId);
    }

    public FlaggedComment createFlaggedComment(
            FlaggedComment flaggedComment) {

        return flaggedCommentRepository.save(flaggedComment);
    }

    public FlaggedComment updateFlaggedComment(
            Long id,
            FlaggedComment updatedComment) {

        return flaggedCommentRepository.findById(id)
                .map(existingComment -> {

                    existingComment.setCommentId(
                            updatedComment.getCommentId());

                    existingComment.setCommentContent(
                            updatedComment.getCommentContent());

                    existingComment.setReportReason(
                            updatedComment.getReportReason());

                    existingComment.setStatus(
                            updatedComment.getStatus());

                    existingComment.setFlaggedDate(
                            updatedComment.getFlaggedDate());

                    return flaggedCommentRepository.save(
                            existingComment);
                })
                .orElseThrow(() -> new RuntimeException(
                        "Flagged comment not found with ID: "
                                + id));
    }

    public void deleteFlaggedComment(Long id) {

        if (!flaggedCommentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Flagged comment not found with ID: " + id);
        }

        flaggedCommentRepository.deleteById(id);
    }
}