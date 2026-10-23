package mindspace_backend;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @NotBlank(message = "Please write a comment before posting.")
    @Size(max = 500, message = "Your comment cannot exceed 500 characters.")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}