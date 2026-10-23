package mindspace_backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

// Staff login and password reset (no token needed for these).
@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class StaffAuthController {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public StaffAuthController(
        UserRepository userRepository,
        PasswordResetRepository passwordResetRepository,
        JwtService jwtService,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !encoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(401, "Wrong email or password.");
        }

        if (!user.isActive()) {
            throw new ApiException(403, "This account is turned off.");
        }

        String role = user.getRole();

        if (!"admin".equals(role) && !"moderator".equals(role)) {
            throw new ApiException(403, "Only staff can use this dashboard.");
        }

        auditService.log(user.getId(), "login", user.getEmail());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", jwtService.create(user.getId()));
        result.put("user", StaffSupport.safe(user));
        return result;
    }

    @PostMapping("/forgot")
    public Map<String, Object> forgot(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            byte[] bytes = new byte[20];
            new SecureRandom().nextBytes(bytes);
            String token = HexFormat.of().formatHex(bytes);

            passwordResetRepository.save(new PasswordReset(
                user.getId(),
                token,
                LocalDateTime.now().plusMinutes(30)
            ));

            // A real site would email this code.
            System.out.println("\n[RESET CODE for " + email + "]: " + token + "\n");
        }

        return Map.of("ok", true);
    }

    @PostMapping("/reset")
    public Map<String, Object> reset(@RequestBody Map<String, String> body) {
        String password = body.getOrDefault("password", "");

        if (password.length() < 8 || password.length() > 72) {
            throw new ApiException(400, "Password needs 8 to 72 characters.");
        }

        PasswordReset reset = passwordResetRepository
            .findByTokenAndExpiresAtAfter(
                body.getOrDefault("token", ""),
                LocalDateTime.now()
            )
            .orElse(null);

        if (reset == null) {
            throw new ApiException(400, "That code is wrong or too old.");
        }

        User user = userRepository.findById(reset.getUserId()).orElse(null);

        if (user == null) {
            throw new ApiException(400, "That code is wrong or too old.");
        }

        user.setPasswordHash(encoder.encode(password));
        userRepository.save(user);
        passwordResetRepository.deleteByUserId(user.getId());
        auditService.log(user.getId(), "password_reset", "");

        return Map.of("ok", true);
    }
}