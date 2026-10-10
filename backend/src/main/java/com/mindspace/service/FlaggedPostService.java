package com.mindspace.service;

import com.mindspace.model.FlaggedPost;
import com.mindspace.repository.FlaggedPostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FlaggedPostService {

    private final FlaggedPostRepository flaggedPostRepository;

    public FlaggedPostService(FlaggedPostRepository flaggedPostRepository) {
        this.flaggedPostRepository = flaggedPostRepository;
    }

    public List<FlaggedPost> getAllFlaggedPosts() {
        return flaggedPostRepository.findAll();
    }

    public Optional<FlaggedPost> getFlaggedPostById(Long id) {
        return flaggedPostRepository.findById(id);
    }

    public Optional<FlaggedPost> getFlaggedPostByPostId(String postId) {
        return flaggedPostRepository.findByPostId(postId);
    }

    public FlaggedPost createFlaggedPost(FlaggedPost flaggedPost) {
        return flaggedPostRepository.save(flaggedPost);
    }

    public FlaggedPost updateFlaggedPost(
            Long id,
            FlaggedPost updatedPost) {

        return flaggedPostRepository.findById(id)
                .map(existingPost -> {

                    existingPost.setPostId(updatedPost.getPostId());
                    existingPost.setPostContent(updatedPost.getPostContent());
                    existingPost.setReportReason(updatedPost.getReportReason());
                    existingPost.setStatus(updatedPost.getStatus());
                    existingPost.setFlaggedDate(updatedPost.getFlaggedDate());

                    return flaggedPostRepository.save(existingPost);
                })
                .orElseThrow(() -> new RuntimeException(
                        "Flagged post not found with ID: " + id));
    }

    public void deleteFlaggedPost(Long id) {

        if (!flaggedPostRepository.existsById(id)) {
            throw new RuntimeException(
                    "Flagged post not found with ID: " + id);
        }

        flaggedPostRepository.deleteById(id);
    }
}