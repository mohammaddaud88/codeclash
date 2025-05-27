package com.codeclash.codeclash.model;


import lombok.Data;
import java.util.List;

@Data
public class CodeRequest {
    private String className;
    private String code;
    private String input;
}
