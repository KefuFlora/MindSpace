package mindspace_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

// On start-up: creates the first staff accounts and default settings if missing.
@Component
public class StaffSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public StaffSeeder(
        UserRepository userRepository,
        SettingRepository settingRepository
    ) {
        this.userRepository = userRepository;
        this.settingRepository = settingRepository;
    }

    private void staff(String username, String email, String password, String role) {
        if (userRepository.existsByEmail(email)
                || userRepository.existsByUsername(username)) {
            return;
        }

        User user = new User(username, email, encoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }

    private void defaultSetting(String name, String value) {
        if (!settingRepository.existsById(name)) {
            settingRepository.save(new Setting(name, value));
        }
    }

    @Override
    public void run(String... args) {
        staff("AdminAmy", "admin@mindspace.com", "Admin123!", "admin");
        staff("ModMax", "mod@mindspace.com", "Moderator123!", "moderator");

        defaultSetting("site_name", "MindSpace");
        defaultSetting("allow_signups", "yes");
        defaultSetting("auto_flag_words", "spam,scam,hate");
        defaultSetting("maintenance_mode", "off");

        System.out.println(
            "MindSpace staff dashboard: http://localhost:8080/admin/ "
                + "(admin@mindspace.com / Admin123!)"
        );
    }
}