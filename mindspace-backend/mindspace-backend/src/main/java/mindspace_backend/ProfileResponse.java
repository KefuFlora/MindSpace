package mindspace_backend;

public record ProfileResponse(
    String username,
    String bio,
    String interests,
    long postCount,
    long commentCount,
    long likedCount,
    long bookmarkCount
) {
}