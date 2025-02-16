package com.codeclash.codeclash.service;

import com.codeclash.codeclash.model.UserSignUp;
import com.codeclash.codeclash.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserSignUp user = userRepo.findByEmail(username);
        if (user == null){
            throw new UsernameNotFoundException("User is not available");
        }

        List<GrantedAuthority> authorityList = new ArrayList<>();
        return new User(user.getEmail(),user.getPassword(),authorityList);
    }
}
