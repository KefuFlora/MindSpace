package mindspace_backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// The logged-in staff member's own profile, password and preferences.
@RestController
@RequestMapping("/api/admin/me")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class StaffMeController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public StaffMeController(
        UserRepository userRepository,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public Map<String, Object> me(@RequestAttribute("user") User me) {
        return StaffSupport.safe(me);
    }

    @PutMapping
    public Map<String, Object> updateProfile(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, String> body
    ) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();

        if (name.length() < 3 || name.length() > 30 || email.isEmpty()) {
            throw new ApiException(400,
                "Name needs 3-30 characters and an email is needed.");
        }

        boolean nameTaken = userRepository.findByUsername(name)
            .filter(other -> !other.getId().equals(me.getId()))
            .isPresent();

        boolean emailTaken = userRepository.findByEmail(email)
            .filter(other -> !other.getId().equals(me.getId()))
            .isPresent();

        if (nameTaken) {
            throw new ApiException(400, "That name is already used.");
        }

        if (emailTaken) {
            throw new ApiException(400, "That email is already used.");
        }

        me.setUsername(name);
        me.setEmail(email);
        userRepository.save(me);

        auditService.log(me.getId(), "profile_update", email);
        return Map.of("ok", true);
    }

    @PutMapping("/password")
    public Map<String, Object> changePassword(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, String> body
    ) {
        if (!encoder.matches(body.getOrDefault("current", ""), me.getPasswordHash())) {
            throw new ApiException(400, "Current password is wrong.");
        }

        String next = body.getOrDefault("next", "");

        if (next.length() < 8 || next.length() > 72) {
            throw new ApiException(400, "New password needs 8 to 72 characters.");
        }

        me.setPasswordHash(encoder.encode(next));
        userRepository.save(me);

        auditService.log(me.getId(), "password_change", "");
        return Map.of("ok", true);
    }

    @PutMapping("/prefs")
    public Map<String, Object> prefs(
        @RequestAttribute("user") User me,
        @RequestBody Map<String, Object> body
    ) {
        me.setTheme("dark".equals(body.get("theme")) ? "dark" : "light");
        me.setNotifyFlagged(StaffSupport.toBoolean(body.get("notify_flagged")));
        me.setNotifySystem(StaffSupport.toBoolean(body.get("notify_system")));
        me.setNotifyEmail(StaffSupport.toBoolean(body.get("notify_email")));
        userRepository.save(me);

        return Map.of("ok", true);
    }
}