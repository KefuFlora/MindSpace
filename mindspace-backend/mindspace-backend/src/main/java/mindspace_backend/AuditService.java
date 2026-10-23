package mindspace_backend;

import org.springframework.stereotype.Service;

// Writes a line into the audit_logs table.
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(Long userId, String action, String details) {
        String safeAction = cut(action, 80);
        String safeDetails = details == null ? "" : cut(details, 255);

        auditLogRepository.save(new AuditLog(userId, safeAction, safeDetails));
    }

    private String cut(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max);
    }
}