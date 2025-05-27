package com.codeclash.codeclash.controller;


import com.codeclash.codeclash.dto.UserProfileDto;
import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "http://192.168.9.100:3000", originPatterns = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class SimpleController {

    @Autowired
    UserProfileService userProfileService;

    @GetMapping("/user")
    public ResponseEntity<String> helloUser(){
        return ResponseEntity.ok("Hello User");
    }

    @PutMapping("/updateUserProfile/{username}")
    public ResponseEntity<UserProfile> updateUserProfile (@RequestBody UserProfileDto userProfileDto,@PathVariable String username) throws Exception {
        return ResponseEntity.ok(userProfileService.updateProfile(userProfileDto,username));
    }

    @GetMapping("/updateUserProfileGetByUsername/{username}")
    public ResponseEntity<UserProfile> getByUsername(@PathVariable String username) throws Exception {
        return ResponseEntity.ok(userProfileService.getByUsername(username));
    }

}
