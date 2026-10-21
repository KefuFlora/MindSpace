package com.mindspace.admin;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

/** Administrator-only: statistics, users, audit logs and system settings. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final List<String> ROLES = List.of("user", "moderator", "admin");
    private final JdbcTemplate db;
    private final Audit audit;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

    public AdminController(JdbcTemplate db, Audit audit) {
        this.db = db;
        this.audit = audit;
    }

    private int count(String sql) {
        Integer n = db.queryForObject(sql, Integer.class);
        return n == null ? 0 : n;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("users", count("SELECT COUNT(*) FROM users WHERE role='user'"));
        s.put("moderators", count("SELECT COUNT(*) FROM users WHERE role='moderator' AND active=1"));
        s.put("posts", count("SELECT COUNT(*) FROM posts"));
        s.put("comments", count("SELECT COUNT(*) FROM comments"));
        s.put("flagged", count("SELECT COUNT(*) FROM posts WHERE status='flagged'")
                + count("SELECT COUNT(*) FROM comments WHERE status='flagged'"));
        s.put("removed", count("SELECT COUNT(*) FROM moderation_history WHERE action='removed'"));
        s.put("approved", count("SELECT COUNT(*) FROM moderation_history WHERE action='approved'"));
        return s;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return db.queryForList("SELECT id,name,email,role,active,created_at FROM users ORDER BY created_at DESC");
    }

    @PostMapping("/users")
    public Map<String, Object> createUser(@RequestAttribute("user") Map<String, Object> me,
                                          @RequestBody Map<String, String> b) {
        String name = b.get("name"), email = b.get("email"), password = b.get("password");
        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.length() < 8) {
            throw new ApiException(400, "Fill every box. Password needs 8+ characters.");
        }
        String role = ROLES.contains(b.get("role")) ? b.get("role") : "user";
        try {
            db.update("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)", name, email, enc.encode(password), role);
        } catch (DuplicateKeyException e) {
            throw new ApiException(400, "That email is already used.");
        }
        audit.log(U.id(me), "user_created", email + " (" + role + ")");
        return Map.of("ok", true);
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(@RequestAttribute("user") Map<String, Object> me,
                                          @PathVariable int id, @RequestBody Map<String, Object> b) {
        if (id == U.id(me)) throw new ApiException(400, "You can't change your own role or status.");
        String role = U.str(b.get("role"));
        if (!ROLES.contains(role)) throw new ApiException(400, "Bad role.");
        boolean active = U.bool(b.get("active"));
        db.update("UPDATE users SET role=?, active=? WHERE id=?", role, active ? 1 : 0, id);
        audit.log(U.id(me), "user_updated", "user #" + id + " -> " + role + ", " + (active ? "active" : "off"));
        return Map.of("ok", true);
    }

    @GetMapping("/audit")
    public List<Map<String, Object>> audit() {
        return db.queryForList("SELECT a.*, u.name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id "
                + "ORDER BY a.created_at DESC LIMIT 300");
    }

    @GetMapping("/settings")
    public Map<String, Object> settings() {
        Map<String, Object> m = new LinkedHashMap<>();
        for (var row : db.queryForList("SELECT name, value FROM settings")) {
            m.put(U.str(row.get("name")), row.get("value"));
        }
        return m;
    }

    @PutMapping("/settings")
    public Map<String, Object> saveSettings(@RequestAttribute("user") Map<String, Object> me,
                                            @RequestBody Map<String, Object> b) {
        for (var e : b.entrySet()) {
            String v = U.str(e.getValue());
            db.update("INSERT INTO settings (name,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?", e.getKey(), v, v);
        }
        audit.log(U.id(me), "settings_update", String.join(", ", b.keySet()));
        return Map.of("ok", true);
    }
}
