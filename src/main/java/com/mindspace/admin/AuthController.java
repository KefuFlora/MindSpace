package com.mindspace.admin;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Login and password reset (no token needed for these). */
@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {
    private final JdbcTemplate db;
    private final JwtService jwt;
    private final Audit audit;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

    public AuthController(JdbcTemplate db, JwtService jwt, Audit audit) {
        this.db = db;
        this.jwt = jwt;
        this.audit = audit;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> b) {
        var rows = db.queryForList("SELECT * FROM users WHERE email=?", b.getOrDefault("email", ""));
        if (rows.isEmpty() || !enc.matches(b.getOrDefault("password", ""), U.str(rows.get(0).get("password_hash")))) {
            throw new ApiException(401, "Wrong email or password.");
        }
        var u = rows.get(0);
        if (!U.bool(u.get("active"))) throw new ApiException(403, "This account is turned off.");
        String role = U.str(u.get("role"));
        if (!role.equals("admin") && !role.equals("moderator")) {
            throw new ApiException(403, "Only staff can use this dashboard.");
        }
        audit.log(U.id(u), "login", U.str(u.get("email")));
        return Map.of("token", jwt.create(U.id(u)), "user", U.safe(u));
    }

    @PostMapping("/forgot")
    public Map<String, Object> forgot(@RequestBody Map<String, String> b) {
        String email = b.getOrDefault("email", "");
        var rows = db.queryForList("SELECT id FROM users WHERE email=?", email);
        if (!rows.isEmpty()) {
            byte[] bytes = new byte[20];
            new SecureRandom().nextBytes(bytes);
            String token = HexFormat.of().formatHex(bytes);
            db.update("INSERT INTO password_resets (user_id,token,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 30 MINUTE))",
                    rows.get(0).get("id"), token);
            System.out.println("\n[RESET CODE for " + email + "]: " + token + "\n"); // a real site would email this
        }
        return Map.of("ok", true);
    }

    @PostMapping("/reset")
    public Map<String, Object> reset(@RequestBody Map<String, String> b) {
        String password = b.getOrDefault("password", "");
        if (password.length() < 8) throw new ApiException(400, "Password needs at least 8 characters.");
        var rows = db.queryForList("SELECT * FROM password_resets WHERE token=? AND expires_at > NOW()", b.getOrDefault("token", ""));
        if (rows.isEmpty()) throw new ApiException(400, "That code is wrong or too old.");
        Object userId = rows.get(0).get("user_id");
        db.update("UPDATE users SET password_hash=? WHERE id=?", enc.encode(password), userId);
        db.update("DELETE FROM password_resets WHERE user_id=?", userId);
        audit.log(((Number) userId).intValue(), "password_reset", "");
        return Map.of("ok", true);
    }
}
