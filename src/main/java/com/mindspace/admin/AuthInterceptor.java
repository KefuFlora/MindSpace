package com.mindspace.admin;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** The bouncer: checks the token on every /api/admin request except login and password reset. */
@Component
public class AuthInterceptor implements HandlerInterceptor {
    private static final String BASE = "/api/admin";
    private static final List<String> ADMIN_ONLY = List.of("/stats", "/users", "/audit", "/settings");

    private final JdbcTemplate db;
    private final JwtService jwt;

    public AuthInterceptor(JdbcTemplate db, JwtService jwt) {
        this.db = db;
        this.jwt = jwt;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if ("OPTIONS".equals(req.getMethod())) return true;
        String path = req.getRequestURI().substring(BASE.length());
        if (path.startsWith("/auth/")) return true;

        String header = req.getHeader("Authorization");
        String token = header == null ? "" : header.replace("Bearer ", "");
        Map<String, Object> user;
        try {
            int id = jwt.verify(token);
            var rows = db.queryForList("SELECT * FROM users WHERE id=? AND active=1", id);
            if (rows.isEmpty()) throw new ApiException(401, "Please log in again.");
            user = rows.get(0);
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(401, "Please log in again.");
        }
        String role = U.str(user.get("role"));
        if (!role.equals("admin") && !role.equals("moderator")) throw new ApiException(401, "Please log in again.");
        if (ADMIN_ONLY.stream().anyMatch(path::startsWith) && !role.equals("admin")) {
            throw new ApiException(403, "Administrators only.");
        }
        req.setAttribute("user", user);
        return true;
    }
}
