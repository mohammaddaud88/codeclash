package com.codeclash.codeclash.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("UserProfile")
@Data
public class UserProfile {

    private String name;
    private String email;
    private String image;
    private String phoneNumber;
    private String instituteName;

}
