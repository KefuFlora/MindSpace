package com.mindspace.controller;

import com.mindspace.dto.ModeratorLoginRequest;
import com.mindspace.dto.ModeratorLoginResponse;
import com.mindspace.model.Moderator;
import com.mindspace.service.ModeratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderators")
@CrossOrigin(origins = "*")
public class ModeratorController {

    private final ModeratorService moderatorService;

    public ModeratorController(ModeratorService moderatorService) {
        this.moderatorService = moderatorService;
    }

    // GET all moderators
    @GetMapping
    public ResponseEntity<List<Moderator>> getAllModerators() {
        return ResponseEntity.ok(moderatorService.getAllModerators());
    }

    // GET moderator by ID
    @GetMapping("/{id}")
    public ResponseEntity<Moderator> getModeratorById(@PathVariable Long id) {

        return moderatorService.getModeratorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create moderator
    @PostMapping
    public ResponseEntity<Moderator> createModerator(
            @RequestBody Moderator moderator) {

        return ResponseEntity.ok(
                moderatorService.createModerator(moderator));
    }

    // PUT update moderator
    @PutMapping("/{id}")
    public ResponseEntity<Moderator> updateModerator(
            @PathVariable Long id,
            @RequestBody Moderator moderator) {

        try {
            return ResponseEntity.ok(
                    moderatorService.updateModerator(id, moderator));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE moderator
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModerator(@PathVariable Long id) {

        try {
            moderatorService.deleteModerator(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody ModeratorLoginRequest request) {

        try {
            ModeratorLoginResponse response = moderatorService.login(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(401)
                    .body(e.getMessage());
        }
    }
}