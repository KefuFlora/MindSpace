package com.mindspace.admin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/** On start-up: creates the first accounts and sample content if they are missing. */
@Component
public class DataSeeder implements CommandLineRunner {
    private final JdbcTemplate db;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

    public DataSeeder(JdbcTemplate db) {
        this.db = db;
    }

    private void user(String name, String email, String password, String role) {
        db.update("INSERT IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)", name, email, enc.encode(password), role);
    }

    private int idOf(String email) {
        return db.queryForObject("SELECT id FROM users WHERE email=?", Integer.class, email);
    }

    @Override
    public void run(String... args) {
        user("Admin Amy", "admin@mindspace.com", "Admin123!", "admin");
        user("Mod Max", "mod@mindspace.com", "Moderator123!", "moderator");
        user("Sam Smith", "sam@example.com", "User1234!", "user");
        user("Lee Jones", "lee@example.com", "User1234!", "user");

        Integer posts = db.queryForObject("SELECT COUNT(*) FROM posts", Integer.class);
        if (posts != null && posts == 0) {
            int sam = idOf("sam@example.com"), lee = idOf("lee@example.com");
            db.update("INSERT INTO posts (user_id,content,status,flag_reason) VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?)",
                    sam, "Buy cheap followers now!!! click this link", "flagged", "Spam",
                    lee, "I really dislike people from that town", "flagged", "Hate speech",
                    sam, "Hello MindSpace, nice to meet you!", "approved", null);
            int firstPost = db.queryForObject("SELECT MIN(id) FROM posts", Integer.class);
            db.update("INSERT INTO comments (user_id,post_id,content,status,flag_reason) VALUES (?,?,?,?,?)",
                    lee, firstPost, "This is a scam, report it", "flagged", "Reported by user");
        }
        int admin = idOf("admin@mindspace.com");
        Integer notes = db.queryForObject("SELECT COUNT(*) FROM notifications WHERE user_id=?", Integer.class, admin);
        if (notes != null && notes == 0) {
            db.update("INSERT INTO notifications (user_id,message) VALUES (?,?),(?,?)",
                    admin, "Items are waiting in the moderation queue", admin, "Welcome to MindSpace admin!");
        }
        System.out.println("MindSpace admin ready: http://localhost:8080/admin/  (admin@mindspace.com / Admin123!)");
    }
}
