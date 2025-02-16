package com.codeclash.codeclash.controller;
import com.codeclash.codeclash.model.UserLogin;
import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.response.AuthResponse;
import com.codeclash.codeclash.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public AuthResponse addUser(@RequestBody UserSignUp userSignUp) throws Exception{
        return userService.saveNewUser(userSignUp);
    }

    @PostMapping("/signin")
    public AuthResponse loginUser(@RequestBody UserLogin login){
        return userService.signIn(login);
    }

    @GetMapping("/allusers/{id}")
    public Optional<UserSignUp> allusers(@PathVariable String id){
        return userService.getAllUsers(id);
    }


}
