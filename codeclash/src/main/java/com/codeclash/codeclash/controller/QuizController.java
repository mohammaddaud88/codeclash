package com.codeclash.codeclash.controller;

import com.codeclash.codeclash.model.QuizResult;
import com.codeclash.codeclash.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
    @Autowired
    QuizResultRepository quizResultRepository;

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam(defaultValue = "10") int amount,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String difficulty
    ) {
        RestTemplate restTemplate = new RestTemplate();

        // Build the API URL dynamically based on parameters
        StringBuilder urlBuilder = new StringBuilder("https://opentdb.com/api.php?amount=" + amount);
        if (!category.isEmpty()) {
            urlBuilder.append("&category=").append(category);
        }
        if (!difficulty.isEmpty()) {
            urlBuilder.append("&difficulty=").append(difficulty);
        }

        String url = urlBuilder.toString();

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            System.out.println("Error fetching from OpenTDB: " + ex.getStatusCode());
            System.out.println("Response Body: " + ex.getResponseBodyAsString());
            return ResponseEntity.status(ex.getStatusCode()).body("Error: " + ex.getResponseBodyAsString());
        }
    }

    @PostMapping("/saveResult")
    public ResponseEntity<?> saveResult(@RequestBody QuizResult result) {
        quizResultRepository.save(result);
        return ResponseEntity.ok("Result saved successfully!");
    }

    @GetMapping("/getResults")
    public ResponseEntity<List<QuizResult>> getAllScores(@RequestParam  String username){
        return ResponseEntity.ok(quizResultRepository.findByUsername(username));
    }
}