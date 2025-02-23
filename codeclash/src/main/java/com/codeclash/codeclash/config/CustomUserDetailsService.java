package com.codeclash.codeclash.config;


import com.codeclash.codeclash.model.User;
import com.codeclash.codeclash.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow(()->
                new UsernameNotFoundException("User not exists by this username or email"));
        return new org.springframework.security.core.userdetails.User(
                username,
                user.getPassword(),
                Collections.emptyList()
        );
    }
}
