package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface QuizResultRepository extends MongoRepository<QuizResult,String> {
    List<QuizResult> findByUsername(String username);
}
