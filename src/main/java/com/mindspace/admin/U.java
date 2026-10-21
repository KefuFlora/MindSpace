package com.mindspace.admin;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Small helpers used by every controller. */
public final class U {
    private U() {}

    public static boolean bool(Object o) {
        return o instanceof Boolean b ? b : o instanceof Number n && n.intValue() != 0;
    }

    public static int id(Map<String, Object> user) {
        return ((Number) user.get("id")).intValue();
    }

    public static String str(Object o) {
        return o == null ? "" : o.toString();
    }

    /** The user fields that are safe to send to the browser (no password hash). */
    public static Map<String, Object> safe(Map<String, Object> u) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (String k : List.of("id", "name", "email", "role", "theme", "notify_flagged", "notify_system", "notify_email")) {
            m.put(k, u.get(k));
        }
        return m;
    }
}
