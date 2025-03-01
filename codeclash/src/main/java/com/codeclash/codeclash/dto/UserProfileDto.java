package com.codeclash.codeclash.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private String name;
    private String department;
    private String college;
    private Date dob;
    private String gender;
    private String phoneNumber;
    private String profilePicUrl;
    private String githubLink;
    private String linkedinLink;
}
