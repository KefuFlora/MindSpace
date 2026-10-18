package com.mindspace.service;

import com.mindspace.dto.ModeratorLoginRequest;
import com.mindspace.dto.ModeratorLoginResponse;
import com.mindspace.model.Moderator;
import com.mindspace.repository.ModeratorRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class ModeratorService {

    private final ModeratorRepository moderatorRepository;
    private final PasswordEncoder passwordEncoder;

    public ModeratorService(
            ModeratorRepository moderatorRepository,
            PasswordEncoder passwordEncoder) {

        this.moderatorRepository = moderatorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all moderators
    public List<Moderator> getAllModerators() {
        return moderatorRepository.findAll();
    }

    // Get moderator by ID
    public Optional<Moderator> getModeratorById(Long id) {
        return moderatorRepository.findById(id);
    }

    // Find moderator by username
    public Optional<Moderator> getModeratorByUsername(String username) {
        return moderatorRepository.findByUsername(username);
    }

    // Find moderator by email
    public Optional<Moderator> getModeratorByEmail(String email) {
        return moderatorRepository.findByEmail(email);
    }

    // Create moderator
    public Moderator createModerator(Moderator moderator) {

        String encodedPassword = passwordEncoder.encode(moderator.getPassword());

        moderator.setPassword(encodedPassword);

        return moderatorRepository.save(moderator);
    }

    // Update moderator
    public Moderator updateModerator(Long id, Moderator updatedModerator) {

        return moderatorRepository.findById(id)
                .map(existingModerator -> {

                    existingModerator.setUsername(updatedModerator.getUsername());
                    existingModerator.setPassword(
                            passwordEncoder.encode(updatedModerator.getPassword()));
                    existingModerator.setFullName(updatedModerator.getFullName());
                    existingModerator.setEmail(updatedModerator.getEmail());
                    return moderatorRepository.save(existingModerator);
                })
                .orElseThrow(() -> new RuntimeException("Moderator not found with ID: " + id));
    }

    // Delete moderator
    public void deleteModerator(Long id) {
        if (!moderatorRepository.existsById(id)) {
            throw new RuntimeException("Moderator not found with ID: " + id);
        }

        moderatorRepository.deleteById(id);
    }

    public ModeratorLoginResponse login(ModeratorLoginRequest request) {

        Optional<Moderator> moderatorOptional = moderatorRepository.findByEmail(request.getUsername());
        if (moderatorOptional.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        Moderator moderator = moderatorOptional.get();

        if (!passwordEncoder.matches(
                request.getPassword(),
                moderator.getPassword())) {

            throw new RuntimeException("Invalid username or password");
        }

        return new ModeratorLoginResponse(
                "Login successful",
                moderator.getId(),
                moderator.getUsername(),
                moderator.getFullName(),
                moderator.getEmail());
    }
}