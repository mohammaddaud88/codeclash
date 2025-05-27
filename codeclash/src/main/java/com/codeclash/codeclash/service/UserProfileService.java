package com.codeclash.codeclash.service;


import com.codeclash.codeclash.dto.UserProfileDto;
import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.repository.UserProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private UserService userService;


    public UserProfile updateProfile(UserProfileDto userProfileDto,String username) throws Exception {
        UserProfile existingUserProfile = userProfileRepo.findByusername(username);
        if(existingUserProfile != null){
            existingUserProfile.setDob(userProfileDto.getDob());
            existingUserProfile.setCollege(userProfileDto.getCollege());
            existingUserProfile.setDepartment(userProfileDto.getDepartment());
            existingUserProfile.setPhoneNumber(userProfileDto.getPhoneNumber());
            existingUserProfile.setProfilePicUrl(userProfileDto.getProfilePicUrl());
            existingUserProfile.setName(userProfileDto.getName());
            existingUserProfile.setGender(userProfileDto.getGender());
            existingUserProfile.setGithubLink(userProfileDto.getGithubLink());
            existingUserProfile.setLinkedinLink(userProfileDto.getLinkedinLink());
            userProfileRepo.save(existingUserProfile);
        } else {
            throw new UsernameNotFoundException("User not found");
        }
        return existingUserProfile;
    }

    public UserProfile getByUsername(String username) throws Exception{
        UserProfile userProfile = userProfileRepo.findByusername(username);
        if(userProfile != null) {
            return userProfile;
        } else {
            throw new UsernameNotFoundException("Username not found");
        }
    }

}
