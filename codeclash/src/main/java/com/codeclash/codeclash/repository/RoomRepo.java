package com.codeclash.codeclash.repository;

import com.codeclash.codeclash.model.Room;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepo extends CrudRepository<Room,String> {
}
