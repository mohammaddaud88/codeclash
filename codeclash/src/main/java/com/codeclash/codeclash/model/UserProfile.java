package com.codeclash.codeclash.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "userProfile")
public class UserProfile {

    @Id
    private String id;
    private String email;
    private String username;
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
