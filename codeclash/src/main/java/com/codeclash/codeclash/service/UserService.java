package com.codeclash.codeclash.service;

import com.codeclash.codeclash.configuration.JwtProvider;
import com.codeclash.codeclash.model.UserLogin;
import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.repository.UserRepo;
import com.codeclash.codeclash.response.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    public UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserDetailsService userDetailsService;

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

    public AuthResponse signIn(UserLogin userLogin){
        Authentication authentication = authenticate(userLogin.getEmail(),userLogin.getPassword());
        UserSignUp userSignUp = userRepo.findByEmail(userLogin.getEmail());
        String token = JwtProvider.generateToken(authentication);

        AuthResponse res = new AuthResponse(token,userSignUp.getEmail(),userSignUp.getName(),"Login Successfull");
        return res;
    }

    public Authentication authenticate(String email, String password){
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if(userDetails == null){
            throw new BadCredentialsException("Invalid username");
        }

        if(!passwordEncoder.matches(password, userDetails.getPassword())){
            throw new BadCredentialsException("Password does not match");
        }
        return new UsernamePasswordAuthenticationToken(userDetails,null);
    }

    public Optional<UserSignUp> getAllUsers(String id){
        Optional<UserSignUp> userSignUp = userRepo.findById(id);
        if(!userSignUp.isPresent()){
            throw new UsernameNotFoundException("Username not found");
        }
        return userSignUp;
    }

//    public UserProfile userProfile(String id){
//        Optional<UserSignUp> user = userRepo.findById(id);
//        if(!user.isPresent()){
//            throw new UsernameNotFoundException("User not found");
//        }
//
//    }
}
