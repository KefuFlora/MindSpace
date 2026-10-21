package com.mindspace.admin;

import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

/** The logged-in person's own profile, password and preferences. */
@RestController
@RequestMapping("/api/admin/me")
public class MeController {
    private final JdbcTemplate db;
    private final Audit audit;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

    public MeController(JdbcTemplate db, Audit audit) {
        this.db = db;
        this.audit = audit;
    }

    @GetMapping
    public Map<String, Object> me(@RequestAttribute("user") Map<String, Object> user) {
        return U.safe(user);
    }

    @PutMapping
    public Map<String, Object> updateProfile(@RequestAttribute("user") Map<String, Object> user,
                                             @RequestBody Map<String, String> b) {
        String name = b.get("name"), email = b.get("email");
        if (name == null || name.isBlank() || email == null || email.isBlank()) {
            throw new ApiException(400, "Name and email are needed.");
        }
        try {
            db.update("UPDATE users SET name=?, email=? WHERE id=?", name, email, U.id(user));
        } catch (DuplicateKeyException e) {
            throw new ApiException(400, "That email is already used.");
        }
        audit.log(U.id(user), "profile_update", email);
        return Map.of("ok", true);
    }

    @PutMapping("/password")
    public Map<String, Object> changePassword(@RequestAttribute("user") Map<String, Object> user,
                                              @RequestBody Map<String, String> b) {
        if (!enc.matches(b.getOrDefault("current", ""), U.str(user.get("password_hash")))) {
            throw new ApiException(400, "Current password is wrong.");
        }
        String next = b.getOrDefault("next", "");
        if (next.length() < 8) throw new ApiException(400, "New password needs at least 8 characters.");
        db.update("UPDATE users SET password_hash=? WHERE id=?", enc.encode(next), U.id(user));
        audit.log(U.id(user), "password_change", "");
        return Map.of("ok", true);
    }

    @PutMapping("/prefs")
    public Map<String, Object> prefs(@RequestAttribute("user") Map<String, Object> user,
                                     @RequestBody Map<String, Object> b) {
        String theme = "dark".equals(b.get("theme")) ? "dark" : "light";
        db.update("UPDATE users SET theme=?, notify_flagged=?, notify_system=?, notify_email=? WHERE id=?",
                theme, U.bool(b.get("notify_flagged")) ? 1 : 0, U.bool(b.get("notify_system")) ? 1 : 0,
                U.bool(b.get("notify_email")) ? 1 : 0, U.id(user));
        return Map.of("ok", true);
    }
}
