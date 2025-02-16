package com.codeclash.codeclash.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("CodeClashSignUp")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSignUp {
    @Id
    private  String id;
    private String name;
    private String email;
    private String password;
}
