package mindspace_backend;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Makes and checks the staff login tokens (valid for 8 hours).
@Service
public class JwtService {

    private final SecretKey key;

    public JwtService(@Value("${mindspace.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String create(Long userId) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .expiration(new Date(System.currentTimeMillis() + 8L * 60 * 60 * 1000))
            .signWith(key)
            .compact();
    }

    public Long verify(String token) {
        String subject = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();

        return Long.parseLong(subject);
    }
}