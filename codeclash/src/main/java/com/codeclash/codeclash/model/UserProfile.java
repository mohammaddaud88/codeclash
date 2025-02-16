package com.codeclash.codeclash.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document()
public class UserProfile {
    private String name;
    private String email;
    private String phoneNumber;

}
