package com.mindspace.controller;

import com.mindspace.model.FlaggedPost;
import com.mindspace.service.FlaggedPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flagged-posts")
@CrossOrigin(origins = "*")
public class FlaggedPostController {

    private final FlaggedPostService flaggedPostService;

    public FlaggedPostController(FlaggedPostService flaggedPostService) {
        this.flaggedPostService = flaggedPostService;
    }

    @GetMapping
    public ResponseEntity<List<FlaggedPost>> getAllFlaggedPosts() {
        return ResponseEntity.ok(
                flaggedPostService.getAllFlaggedPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlaggedPost> getFlaggedPostById(
            @PathVariable Long id) {

        return flaggedPostService.getFlaggedPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<FlaggedPost> getFlaggedPostByPostId(
            @PathVariable String postId) {

        return flaggedPostService.getFlaggedPostByPostId(postId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FlaggedPost> createFlaggedPost(
            @RequestBody FlaggedPost flaggedPost) {

        return ResponseEntity.ok(
                flaggedPostService.createFlaggedPost(flaggedPost));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlaggedPost> updateFlaggedPost(
            @PathVariable Long id,
            @RequestBody FlaggedPost flaggedPost) {

        try {

            return ResponseEntity.ok(
                    flaggedPostService.updateFlaggedPost(
                            id,
                            flaggedPost));

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlaggedPost(
            @PathVariable Long id) {

        try {

            flaggedPostService.deleteFlaggedPost(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}