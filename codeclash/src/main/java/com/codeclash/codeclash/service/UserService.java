package com.codeclash.codeclash.service;

import com.codeclash.codeclash.configuration.JwtProvider;
import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.repository.UserRepo;
import com.codeclash.codeclash.response.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    public UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse saveNewUser(UserSignUp user) throws Exception{

        UserSignUp isExist = userRepo.findByEmail(user.getEmail());
        if (isExist != null){
            throw new Exception("Email already exist");
        }

        UserSignUp userSignUp = new UserSignUp();
        userSignUp.setName(user.getName());
        userSignUp.setEmail(user.getEmail());
        userSignUp.setPassword(passwordEncoder.encode(user.getPassword()));
        UserSignUp user2 = userRepo.save(userSignUp);

        Authentication authentication = new UsernamePasswordAuthenticationToken(user2.getEmail(),user2.getPassword());

        String token = JwtProvider.generateToken(authentication);
        AuthResponse response = new AuthResponse(token,"Registration Success");
        return response;
    }
}
