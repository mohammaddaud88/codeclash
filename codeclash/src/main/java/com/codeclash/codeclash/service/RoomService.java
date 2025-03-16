package com.codeclash.codeclash.service;

import com.codeclash.codeclash.model.Room;
import com.codeclash.codeclash.repository.RoomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private static final String ROOM_PREFIX = "room:";

    @Autowired
    private RedisTemplate<String,Room> redisTemplate;


    public String createRoom(String host){
        String roomCode = UUID.randomUUID().toString().substring(0,6);
        Room room = new Room(roomCode,host);

        redisTemplate.opsForValue().set(ROOM_PREFIX+roomCode,room);
        return roomCode;
    }
    public Room joinRoom(String roomCode, String playerUsername){
        Room room = redisTemplate.opsForValue().get(ROOM_PREFIX+roomCode);
        if(room != null){
            room.addPlayer(playerUsername);
            redisTemplate.opsForValue().set(ROOM_PREFIX+roomCode,room);
            return room;
        }
        return null;
    }

    public Room getRoom(String roomCode){
        return redisTemplate.opsForValue().get(ROOM_PREFIX+roomCode);
    }

    public List<Room> getAllRoom(){
        Set<String> keys = redisTemplate.keys(ROOM_PREFIX + "*");
        if(keys == null){
            return List.of();
        }
        return keys.stream()
                .map(key->redisTemplate.opsForValue().get(key))
                .collect(Collectors.toList());
    }

}
