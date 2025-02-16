package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.UserSignUp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<UserSignUp,String> {
    UserSignUp findByEmail(String email);
}
