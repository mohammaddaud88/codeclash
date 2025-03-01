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


    public UserProfile updateProfile(UserProfileDto userProfileDto,String id) throws Exception {
        Optional<UserProfile> existingUserProfile = userProfileRepo.findById(id);
        UserProfile userProfile;
        if(existingUserProfile.isPresent()){
            userProfile = existingUserProfile.get();
            userProfile.setDob(userProfileDto.getDob());
            userProfile.setCollege(userProfileDto.getCollege());
            userProfile.setDepartment(userProfileDto.getDepartment());
            userProfile.setPhoneNumber(userProfileDto.getPhoneNumber());
            userProfile.setProfilePicUrl(userProfileDto.getProfilePicUrl());
            userProfile.setName(userProfileDto.getName());
            userProfile.setGender(userProfileDto.getGender());
            userProfile.setGithubLink(userProfileDto.getGithubLink());
            userProfile.setLinkedinLink(userProfileDto.getLinkedinLink());
            userProfileRepo.save(userProfile);
        } else {
            throw new UsernameNotFoundException("User not found");
        }
        return userProfile;
    }

}
