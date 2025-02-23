package com.codeclash.codeclash.service;

import com.codeclash.codeclash.dto.LoginDto;

public interface AuthService {
    String login(LoginDto loginDto);
}
