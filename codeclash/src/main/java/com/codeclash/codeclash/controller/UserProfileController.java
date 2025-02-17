package com.codeclash.codeclash.controller;

import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
public class UserProfileController {

    @Autowired
    public UserProfileService userProfileService;

    @PutMapping("/updateprofile")
    public String updateProfile(@RequestParam String email, @RequestBody UserProfile userProfile){
        return userProfileService.updateProfile(email,userProfile);
    }
}


// https://medium.com/@hakeembaseem/custom-authentication-in-springboot-3-x-and-java-17-using-database-58ae446a4065