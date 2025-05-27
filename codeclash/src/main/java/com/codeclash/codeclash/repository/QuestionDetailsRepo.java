package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface QuestionDetailsRepo extends MongoRepository<Question,String> {

}
