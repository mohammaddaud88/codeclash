package com.codeclash.codeclash.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@Document(collection = "codeSubmit")
public class CodeSubmit {

    private final int questionId = UUID.randomUUID().hashCode();
    private String title;
    private String category;
    private String code;
    private String language;
    private int testCasesPassed;
}
