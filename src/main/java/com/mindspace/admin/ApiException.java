package com.mindspace.admin;

/** Throw this to send {"error": "..."} with a status code to the browser. */
public class ApiException extends RuntimeException {
    public final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }
}
