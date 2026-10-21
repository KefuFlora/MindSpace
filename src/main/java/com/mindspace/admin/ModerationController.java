package com.mindspace.admin;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

/** Moderator tools (admins can use them too). */
@RestController
@RequestMapping("/api/admin")
public class ModerationController {
    private final JdbcTemplate db;
    private final Audit audit;

    public ModerationController(JdbcTemplate db, Audit audit) {
        this.db = db;
        this.audit = audit;
    }

    @GetMapping("/flagged")
    public List<Map<String, Object>> flagged(@RequestParam(defaultValue = "posts") String type) {
        String table = type.equals("comments") ? "comments" : "posts"; // only these two names are ever used
        return db.queryForList("SELECT c.id, c.content, c.flag_reason, c.created_at, u.name AS author FROM " + table
                + " c JOIN users u ON u.id=c.user_id WHERE c.status='flagged' ORDER BY c.created_at DESC");
    }

    @PostMapping("/review")
    public Map<String, Object> review(@RequestAttribute("user") Map<String, Object> user,
                                      @RequestBody Map<String, Object> b) {
        String type = U.str(b.get("type")), action = U.str(b.get("action"));
        if (!List.of("post", "comment").contains(type) || !List.of("approved", "removed").contains(action)
                || !(b.get("id") instanceof Number idNum)) {
            throw new ApiException(400, "Bad request.");
        }
        int id = idNum.intValue();
        String table = type.equals("post") ? "posts" : "comments";
        String note = U.str(b.get("note"));
        db.update("UPDATE " + table + " SET status=? WHERE id=?", action, id);
        db.update("INSERT INTO moderation_history (moderator_id,content_type,content_id,action,note) VALUES (?,?,?,?,?)",
                U.id(user), type, id, action, note.isEmpty() ? null : note);
        audit.log(U.id(user), "review_" + action, type + " #" + id);
        return Map.of("ok", true);
    }

    @GetMapping("/history")
    public List<Map<String, Object>> history() {
        return db.queryForList("SELECT h.*, u.name AS moderator FROM moderation_history h "
                + "JOIN users u ON u.id=h.moderator_id ORDER BY h.created_at DESC LIMIT 200");
    }

    @GetMapping("/notifications")
    public List<Map<String, Object>> notifications(@RequestAttribute("user") Map<String, Object> user) {
        return db.queryForList("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50", U.id(user));
    }

    @PostMapping("/notifications/read")
    public Map<String, Object> markRead(@RequestAttribute("user") Map<String, Object> user) {
        db.update("UPDATE notifications SET is_read=1 WHERE user_id=?", U.id(user));
        return Map.of("ok", true);
    }
}
