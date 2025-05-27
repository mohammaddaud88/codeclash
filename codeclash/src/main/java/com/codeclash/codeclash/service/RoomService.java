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

    @Autowired
    private RoomRepo roomRepo;

    private static final String ROOM_PREFIX = "room:";

    @Autowired
    private RedisTemplate<String,Room> redisTemplate;

    @Autowired
    private RedisTemplate<String, String> redisStringTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    public String createRoom(Room host){
        String roomCode = UUID.randomUUID().toString().substring(0,6);
        Room room = new Room(roomCode, host.getHost());
        room.setDifficulty(host.getDifficulty());
        room.setTopic(host.getTopic());
        room.setRoomCode(roomCode);
        room.setHost(host.getHost());
        room.setPlayers(host.getPlayers());
        roomRepo.save(room);

        redisTemplate.opsForValue().set(ROOM_PREFIX+roomCode,room);
        return roomCode;
    }
    public Room joinRoom(String roomCode, String playerUsername) {
        Room room = redisTemplate.opsForValue().get(ROOM_PREFIX + roomCode);

        if (room != null) {
            redisStringTemplate.opsForSet().add(ROOM_PREFIX + roomCode + ":players", playerUsername);

            Set<String> updatedPlayers = redisStringTemplate.opsForSet().members(ROOM_PREFIX + roomCode + ":players");

            room.setPlayers(updatedPlayers);
            updateRoomInRedis(roomCode,room);

            redisTemplate.opsForValue().set(ROOM_PREFIX + roomCode, room);

            messagingTemplate.convertAndSend("/topic/room/" + roomCode, room);

            return room;
        }
        return null;
    }

    public void updateRoomInRedis(String roomCode, Room room) {
        // Log before saving to Redis
        System.out.println("🔄 Updating Redis for Room: " + roomCode);
        System.out.println("👤 Players in Room: " + room.getPlayers());

        // Save to Redis
        redisTemplate.opsForValue().set(ROOM_PREFIX + roomCode, room);

        // Send WebSocket message to frontend
        System.out.println("📢 Broadcasting update to /topic/room/" + roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, room);
    }
    public Room getRoom(String roomCode){
        return redisTemplate.opsForValue().get(ROOM_PREFIX+roomCode);
    }

    public List<Room> getAllRoom(){
        Set<String> keys = redisTemplate.keys(ROOM_PREFIX + "*");
        if(keys.isEmpty()){
            return List.of();
        }
        return keys.stream()
                .map(key->redisTemplate.opsForValue().get(key))
                .collect(Collectors.toList());
    }

    public Room getById(String roomCode) {
        return redisTemplate.opsForValue().get(ROOM_PREFIX + roomCode);
    }

}
