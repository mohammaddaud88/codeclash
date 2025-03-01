package com.codeclash.codeclash.service;

import com.codeclash.codeclash.dto.UserRegistrationDto;
import com.codeclash.codeclash.model.User;
import com.codeclash.codeclash.model.UserProfile;
import com.codeclash.codeclash.repository.UserProfileRepo;
import com.codeclash.codeclash.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserProfileRepo userProfileRepo;

    public User registerUser(UserRegistrationDto userRegistrationDto){
        if(userRepository.existsByEmail(userRegistrationDto.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(userRegistrationDto.getName());
        user.setUsername(userRegistrationDto.getUsername());
        user.setEmail(userRegistrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(userRegistrationDto.getPassword()));

        // now we are also adding email, username and name to user profile
        UserProfile userProfile = new UserProfile();
        userProfile.setName(userRegistrationDto.getName());
        userProfile.setUsername(userRegistrationDto.getUsername());
        userProfile.setEmail(userRegistrationDto.getEmail());
        userProfileRepo.save(userProfile);

        return userRepository.save(user);
    }
}
