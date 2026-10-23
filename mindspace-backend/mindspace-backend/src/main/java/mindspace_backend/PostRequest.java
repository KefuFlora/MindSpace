
package mindspace_backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PostRequest {

    @NotBlank(message = "Please select a topic.")
    @Pattern(
        regexp = "Financial Stress|Academic Stress|Anxiety|Depression|General Support",
        message = "Please select a valid topic."
    )
    private String topic;

    @NotBlank(message = "Please write something before posting.")
    @Size(max = 2000, message = "Your post cannot exceed 2000 characters.")
    private String content;

    private boolean hasTriggerWarning;

    @Size(max = 100, message = "The content warning cannot exceed 100 characters.")
    private String triggerWarning;

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isHasTriggerWarning() {
        return hasTriggerWarning;
    }

    public void setHasTriggerWarning(boolean hasTriggerWarning) {
        this.hasTriggerWarning = hasTriggerWarning;
    }

    public String getTriggerWarning() {
        return triggerWarning;
    }

    public void setTriggerWarning(String triggerWarning) {
        this.triggerWarning = triggerWarning;
    }
}
