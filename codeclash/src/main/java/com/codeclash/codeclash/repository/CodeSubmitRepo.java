package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.CodeSubmit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeSubmitRepo extends MongoRepository<CodeSubmit,String> {
}
