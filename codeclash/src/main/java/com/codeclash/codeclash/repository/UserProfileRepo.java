package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepo extends MongoRepository<UserProfile,String> {

    UserProfile findByEmail(String email);
}
