package com.codeclash.codeclash.controller;


import com.codeclash.codeclash.dto.UserProfileDto;
import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SimpleController {

    @Autowired
    UserProfileService userProfileService;

    @GetMapping("/user")
    public ResponseEntity<String> helloUser(){
        return ResponseEntity.ok("Hello User");
    }

    @PutMapping("/updateUserProfile/{id}")
    public ResponseEntity<UserProfile> updateUserProfile (@RequestBody UserProfileDto userProfileDto,@PathVariable String id) throws Exception {
        return ResponseEntity.ok(userProfileService.updateProfile(userProfileDto,id));
    }
}
