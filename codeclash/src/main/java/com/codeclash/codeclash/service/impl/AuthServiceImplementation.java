package com.codeclash.codeclash.service.impl;

import com.codeclash.codeclash.config.JwtTokenProvider;
import com.codeclash.codeclash.dto.LoginDto;
import com.codeclash.codeclash.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImplementation implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public String login(LoginDto loginDto) {
        // 1- Now we authenticate the user
        Authentication authentication= authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.getUsername(),
                loginDto.getPassword()
        ));

        // 2- SecurityContextHolder is used to allows the rest of the application to know that the user is authenticated and can use user data from Authentication object
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3- Generate the token based on username and secret key
        String token  = jwtTokenProvider.generateToken(authentication);
        return token;
    }
}
