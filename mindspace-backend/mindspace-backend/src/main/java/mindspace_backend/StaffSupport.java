package mindspace_backend;

import java.util.LinkedHashMap;
import java.util.Map;

// Small helpers shared by the staff controllers.
public final class StaffSupport {

    private StaffSupport() {
    }

    public static boolean toBoolean(Object value) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }

        return value instanceof Number && ((Number) value).intValue() != 0;
    }

    public static String text(Object value) {
        return value == null ? "" : value.toString();
    }

    // The user fields that are safe to send to the browser (no password hash).
    public static Map<String, Object> safe(User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("name", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", user.getRole());
        result.put("theme", user.getTheme());
        result.put("notify_flagged", user.isNotifyFlagged());
        result.put("notify_system", user.isNotifySystem());
        result.put("notify_email", user.isNotifyEmail());
        return result;
    }
}