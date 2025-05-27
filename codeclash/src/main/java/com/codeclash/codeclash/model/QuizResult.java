package com.codeclash.codeclash.model;


import lombok.Data;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "quizResult")
@Data
public class QuizResult {
    @Id
    private String id;
    private String username;
    private int score;
    private LocalDate date;
    private LocalTime time;
    private int No_of_questions;

}