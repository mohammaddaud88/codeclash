package com.codeclash.codeclash.controller;
import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.response.AuthResponse;
import com.codeclash.codeclash.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("signup")
    public AuthResponse addUser(@RequestBody UserSignUp userSignUp) throws Exception{
        return userService.saveNewUser(userSignUp);
    }

}
