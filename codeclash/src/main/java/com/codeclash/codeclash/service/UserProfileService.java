package com.codeclash.codeclash.service;

import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.repository.UserProfileRepo;
import com.codeclash.codeclash.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class UserProfileService {

    @Autowired
    public UserProfileRepo userProfileRepo;

    @Autowired
    public UserRepo userRepo;

    public String updateProfile(String userEmail,UserProfile userProfile){
        UserSignUp userDetails = userRepo.findByEmail(userEmail);
        if(userDetails == null)
        {
            throw new UsernameNotFoundException("User does not exist");
        }
        UserProfile userUpdate = userProfileRepo.findByEmail(userEmail);

        if (userUpdate == null){
            userUpdate = new UserProfile();
            userUpdate.setName(userDetails.getName());
            userUpdate.setEmail(userDetails.getEmail());
        }

        userUpdate.setName(userProfile.getName());
        userUpdate.setInstituteName(userProfile.getInstituteName());
        userUpdate.setPhoneNumber(userProfile.getPhoneNumber());
        userUpdate.setImage(userProfile.getImage());
        userProfileRepo.save(userUpdate);
        return "Profile updated";
    }
}
