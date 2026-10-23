
package mindspace_backend;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;


@CrossOrigin(
    origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    },
    allowCredentials = "true"
)

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request) {

        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username is already taken"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email is already registered"));
        }

        User user = new User(
                username,
                email,
                passwordEncoder.encode(request.getPassword())
        );

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Account created successfully"));
    }
    
@PostMapping("/login")
public ResponseEntity<Map<String, String>> login(
        @Valid @RequestBody LoginRequest request,
        HttpSession session) {

    String email = request.getEmail().trim().toLowerCase();

    var userOptional = userRepository.findByEmail(email);

    if (userOptional.isEmpty()
            || !passwordEncoder.matches(
                    request.getPassword(),
                    userOptional.get().getPasswordHash())) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
    }

    User user = userOptional.get();

    session.setAttribute("userId", user.getId());
    session.setAttribute("username", user.getUsername());

    return ResponseEntity.ok(
            Map.of(
                    "message", "Login successful",
                    "username", user.getUsername()
            )
    );
}

@GetMapping("/me")
public ResponseEntity<Map<String, String>> getCurrentUser(
        HttpSession session) {

    Object userId = session.getAttribute("userId");
    Object username = session.getAttribute("username");

    if (userId == null || username == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Not logged in"));
    }

    return ResponseEntity.ok(
            Map.of("username", username.toString())
    );
}

@PostMapping("/logout")
public ResponseEntity<Map<String, String>> logout(
        HttpSession session) {

    session.invalidate();

    return ResponseEntity.ok(
            Map.of("message", "Logout successful")
    );
}


}
