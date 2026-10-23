package mindspace_backend;

// Thrown by the staff (admin and moderator) API to send an error to the browser.
public class ApiException extends RuntimeException {

    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}