package mindspace_backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Administrator-only: statistics, users, audit logs and system settings.
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class StaffAdminController {

    private static final List<String> ROLES = List.of("user", "moderator", "admin");
    private static final List<String> SETTING_NAMES = List.of(
        "site_name", "allow_signups", "auto_flag_words", "maintenance_mode"
    );

    private final JdbcTemplate db;
    private final UserRepository userRepository;
    private final SettingsService settingsService;
    private final AuditService auditService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public StaffAdminController(
        JdbcTemplate db,
        UserRepository userRepository,
        SettingsService settingsService,
        AuditService auditService
    ) {
        this.db = db;
        this.userRepository = userRepository;
        this.settingsService = settingsService;
        this.auditService = auditService;
    }

    private int count(String sql) {
        Integer total = db.queryForObject(sql, Integer.class);
        return total == null ? 0 : total;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("users", count("SELECT COUNT(*) FROM users WHERE role='user'"));
        stats.put("moderators", count(
            "SELECT COUNT(*) FROM users WHERE role='moderator' AND active=1"));
        stats.put("posts", count(
            "SELECT COUNT(*) FROM posts WHERE status<>'removed'"));
        stats.put("comments", count(
            "SELECT COUNT(*) FROM comments WHERE status<>'removed'"));
        stats.put("flagged",
            count("SELECT COUNT(*) FROM posts WHERE status='flagged'")
                + count("SELECT COUNT(*) FROM comments WHERE status='flagged'"));
        stats.put("removed", count(
            "SELECT COUNT(*) FROM moderation_history WHERE action='removed'"));
        stats.put("approved", count(
            "SELECT COUNT(*) FROM moderation_history WHERE action='approved'"));

        return stats;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return db.queryForList(
            "SELECT id, username AS name, email, role, active, created_at "
                + "FROM users ORDER BY created_at DESC, id DESC");
    }

    @PostMapping("/users")
    public Map<String, Object> createUser(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, String> body
    ) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");

        if (name.length() < 3 || name.length() > 30 || email.isEmpty()
                || password.length() < 8 || password.length() > 72) {
            throw new ApiException(400,
                "Name needs 3-30 characters, an email is needed and the password needs 8+ characters.");
        }

        String role = ROLES.contains(body.get("role")) ? body.get("role") : "user";

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(400, "That email is already used.");
        }

        if (userRepository.existsByUsername(name)) {
            throw new ApiException(400, "That name is already used.");
        }

        User user = new User(name, email, encoder.encode(password));
        user.setRole(role);
        userRepository.save(user);

        auditService.log(me.getId(), "user_created", email + " (" + role + ")");
        return Map.of("ok", true);
    }

    @PutMapping("/users/{id}")
    public Map<String, Object> updateUser(
        @RequestAttribute("user") User me,
        @PathVariable Long id,
        @RequestBody Map<String, Object> body
    ) {
        if (id.equals(me.getId())) {
            throw new ApiException(400, "You can't change your own role or status.");
        }

        String role = StaffSupport.text(body.get("role"));

        if (!ROLES.contains(role)) {
            throw new ApiException(400, "Bad role.");
        }

        boolean active = StaffSupport.toBoolean(body.get("active"));

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            throw new ApiException(404, "User not found.");
        }

        user.setRole(role);
        user.setActive(active);
        userRepository.save(user);

        auditService.log(me.getId(), "user_updated",
            "user #" + id + " -> " + role + ", " + (active ? "active" : "off"));
        return Map.of("ok", true);
    }

    @GetMapping("/audit")
    public List<Map<String, Object>> audit() {
        return db.queryForList(
            "SELECT a.id, a.user_id, a.action, a.details, a.created_at, "
                + "u.username AS name FROM audit_logs a "
                + "LEFT JOIN users u ON u.id = a.user_id "
                + "ORDER BY a.created_at DESC, a.id DESC LIMIT 300");
    }

    @GetMapping("/settings")
    public Map<String, Object> settings() {
        return settingsService.all();
    }

    @PutMapping("/settings")
    public Map<String, Object> saveSettings(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, Object> body
    ) {
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if (!SETTING_NAMES.contains(entry.getKey())) {
                continue;
            }

            String value = StaffSupport.text(entry.getValue()).trim();

            if (value.length() > 255) {
                throw new ApiException(400, "That setting is too long.");
            }

            settingsService.set(entry.getKey(), value);
        }

        auditService.log(me.getId(), "settings_update", String.join(", ", body.keySet()));
        return Map.of("ok", true);
    }
}