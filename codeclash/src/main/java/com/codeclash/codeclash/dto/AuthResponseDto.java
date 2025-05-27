package com.codeclash.codeclash.dto;

import lombok.Data;

@Data
public class AuthResponseDto {
    private String accessToken;
    private String username;
}
