package com.codeclash.codeclash.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class Question {
        private String category;
        private String type;
        private String difficulty;
        private String question;
        private String correct_answer;
        private List<String> incorrect_answers;
    }
