package com.mindspace.admin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Writes a line into the audit_logs table. */
@Component
public class Audit {
    private final JdbcTemplate db;

    public Audit(JdbcTemplate db) {
        this.db = db;
    }

    public void log(Integer userId, String action, String details) {
        db.update("INSERT INTO audit_logs (user_id,action,details) VALUES (?,?,?)", userId, action, details);
    }
}
