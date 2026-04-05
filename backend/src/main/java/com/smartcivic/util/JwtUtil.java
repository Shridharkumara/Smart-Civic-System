package com.smartcivic.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

public class JwtUtil {
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor("SmartCivicIssueReportingSystemSuperSecret2026".getBytes());
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24 * 7; // 7 days

    public static String createToken(int userId, String name, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setClaims(Map.of("name", name, "email", email, "role", role))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token);
    }
}
