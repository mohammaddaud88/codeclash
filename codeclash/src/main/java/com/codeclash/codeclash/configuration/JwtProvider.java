package com.codeclash.codeclash.configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Stack;

import static javax.crypto.Cipher.SECRET_KEY;

public class JwtProvider {
    private static SecretKey key = Keys.hmacShaKeyFor(JwtConstant.secretKey.getBytes());

    public static String generateToken(Authentication authentication) {

        String jwt = Jwts.builder()
                .setIssuer("By Daud")
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + 8600000))
                .claim("email", authentication.getName())
                .signWith(key)
                .compact();
        return jwt;
    }

    public static String getEmailFromJwtToken(String jwt) {
        // Bearer token
        if(jwt.startsWith("Bearer ")){
            jwt = jwt.substring(7);
        }

        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(jwt).getPayload();

//        String email=  String.valueOf(claims.get("email"));
        return claims.get("email", String.class);
    }
}
