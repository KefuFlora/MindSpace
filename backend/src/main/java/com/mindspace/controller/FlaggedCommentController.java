package com.mindspace.controller;

import com.mindspace.model.FlaggedComment;
import com.mindspace.service.FlaggedCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flagged-comments")
@CrossOrigin(origins = "*")
public class FlaggedCommentController {

    private final FlaggedCommentService flaggedCommentService;

    public FlaggedCommentController(
            FlaggedCommentService flaggedCommentService) {

        this.flaggedCommentService = flaggedCommentService;
    }

    @GetMapping
    public ResponseEntity<List<FlaggedComment>> getAllFlaggedComments() {

        return ResponseEntity.ok(
                flaggedCommentService.getAllFlaggedComments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlaggedComment> getFlaggedCommentById(
            @PathVariable Long id) {

        return flaggedCommentService.getFlaggedCommentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<FlaggedComment> getFlaggedCommentByCommentId(
            @PathVariable String commentId) {

        return flaggedCommentService
                .getFlaggedCommentByCommentId(commentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FlaggedComment> createFlaggedComment(
            @RequestBody FlaggedComment flaggedComment) {

        return ResponseEntity.ok(
                flaggedCommentService.createFlaggedComment(
                        flaggedComment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlaggedComment> updateFlaggedComment(
            @PathVariable Long id,
            @RequestBody FlaggedComment flaggedComment) {

        try {

            return ResponseEntity.ok(
                    flaggedCommentService.updateFlaggedComment(
                            id,
                            flaggedComment));

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlaggedComment(
            @PathVariable Long id) {

        try {

            flaggedCommentService.deleteFlaggedComment(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}