package mindspace_backend;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class SettingsService {

    private final SettingRepository settingRepository;

    public SettingsService(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    public String get(String name, String fallback) {
        return settingRepository.findById(name)
            .map(Setting::getValue)
            .orElse(fallback);
    }

    public void set(String name, String value) {
        settingRepository.save(new Setting(name, value));
    }

    public Map<String, Object> all() {
        Map<String, Object> result = new LinkedHashMap<>();

        for (Setting setting : settingRepository.findAll()) {
            result.put(setting.getName(), setting.getValue());
        }

        return result;
    }

    public boolean isSignupsAllowed() {
        return !"no".equalsIgnoreCase(get("allow_signups", "yes"));
    }

    public boolean isMaintenanceMode() {
        return "on".equalsIgnoreCase(get("maintenance_mode", "off"));
    }

    // Returns the first auto-flag word found in the text, or null.
    public String findFlaggedWord(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        String[] words = get("auto_flag_words", "").split(",");

        for (String raw : words) {
            String word = raw.trim();

            if (word.isEmpty()) {
                continue;
            }

            Pattern pattern = Pattern.compile(
                "(?<![\\p{L}\\p{N}])" + Pattern.quote(word)
                    + "(?![\\p{L}\\p{N}])",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
            );

            if (pattern.matcher(text).find()) {
                return word.length() > 100 ? word.substring(0, 100) : word;
            }
        }

        return null;
    }
}