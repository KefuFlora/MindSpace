package com.mindspace.repository;

import com.mindspace.model.Moderator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModeratorRepository extends JpaRepository<Moderator, Long> {

    Optional<Moderator> findByUsername(String username);

    Optional<Moderator> findByEmail(String email);
}