package com.codeclash.codeclash.dto;

import lombok.Data;

@Data
public class UserRegistrationDto {

    private String name;
    private String username;
    private String email;
    private String password;

    public UserRegistrationDto() {
    }

    public UserRegistrationDto(String name, String username, String email, String password) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
    }


}
