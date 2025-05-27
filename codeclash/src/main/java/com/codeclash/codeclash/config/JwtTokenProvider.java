package com.codeclash.codeclash.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private String jwtSecret = "af60addca9ea3e3c099551e1b6576c9966dce0a33de879dd7e160f86dbd872c";
    private long jwtExpirationDate = 24 * 60 * 60 * 1000;

    public String generateToken(Authentication authentication){
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime()+jwtExpirationDate);

        String token = Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(expireDate)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
        return token;
    }
    private Key key(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Extracting username from Jwt token
     public String getUsername(String token){
        return Jwts.parser()
                .verifyWith((SecretKey) key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
     }

     // validate jwt token

    public boolean validateToken(String token){
        Jwts.parser()
                .verifyWith((SecretKey) key())
                .build()
                .parse(token);
        return true;
    }
}
