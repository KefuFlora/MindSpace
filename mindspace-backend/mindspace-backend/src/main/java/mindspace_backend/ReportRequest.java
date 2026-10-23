package mindspace_backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReportRequest {

    @NotBlank(message = "Content type is required.")
    private String type;

    @NotNull(message = "Content id is required.")
    private Long id;

    @NotBlank(message = "Please select a reason for your report.")
    @Size(max = 100, message = "The reason cannot exceed 100 characters.")
    private String reason;

    @Size(max = 500, message = "Details cannot exceed 500 characters.")
    private String details;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}