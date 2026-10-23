package mindspace_backend;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

// Checks the staff token on every /api/admin request except login and password reset.
@Component
public class StaffAuthInterceptor implements HandlerInterceptor {

    private static final String BASE = "/api/admin";
    private static final List<String> ADMIN_ONLY =
        List.of("/stats", "/users", "/audit", "/settings", "/moderators", "/reverse");

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public StaffAuthInterceptor(
        UserRepository userRepository,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler
    ) {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI().substring(BASE.length());

        if (path.startsWith("/auth/")) {
            return true;
        }

        String header = request.getHeader("Authorization");
        String token = header == null ? "" : header.replace("Bearer ", "");

        User user;

        try {
            Long id = jwtService.verify(token);
            user = userRepository.findById(id).orElse(null);
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(401, "Please log in again.");
        }

        if (user == null || !user.isActive()) {
            throw new ApiException(401, "Please log in again.");
        }

        String role = user.getRole();
        boolean isAdmin = "admin".equals(role);

        if (!isAdmin && !"moderator".equals(role)) {
            throw new ApiException(401, "Please log in again.");
        }

        boolean adminOnly = ADMIN_ONLY.stream().anyMatch(path::startsWith);

        if (adminOnly && !isAdmin) {
            throw new ApiException(403, "Administrators only.");
        }

        request.setAttribute("user", user);
        return true;
    }
}