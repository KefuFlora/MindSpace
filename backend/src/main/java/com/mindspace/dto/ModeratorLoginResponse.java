package com.mindspace.dto;

public class ModeratorLoginResponse {

    private String message;
    private Long id;
    private String username;
    private String fullName;
    private String email;

    public ModeratorLoginResponse() {
    }

    public ModeratorLoginResponse(
            String message,
            Long id,
            String username,
            String fullName,
            String email) {

        this.message = message;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}