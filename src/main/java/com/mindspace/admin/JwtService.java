package com.mindspace.admin;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Makes and checks the login tokens (valid for 8 hours). */
@Service
public class JwtService {
    private final SecretKey key;

    public JwtService(@Value("${mindspace.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String create(int userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .expiration(new Date(System.currentTimeMillis() + 8L * 60 * 60 * 1000))
                .signWith(key)
                .compact();
    }

    public int verify(String token) {
        String sub = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
        return Integer.parseInt(sub);
    }
}
