package com.codeclash.codeclash.controller;


import com.codeclash.codeclash.dto.RoomRequestDto;
import com.codeclash.codeclash.model.Room;
import com.codeclash.codeclash.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/room/create")
    public String createRoom(@RequestParam String username){
        String roomCode = roomService.createRoom(username);
        return roomCode;
    }

    @PostMapping("/room/join")
    public String joinRoom(@RequestParam String roomCode, @RequestParam String playerUsername){
        Room room = roomService.joinRoom(roomCode,playerUsername);
        if(room != null){
            messagingTemplate.convertAndSend("/topic/room/"+roomCode,room);
            return "Joined Room: "+roomCode;
        } else {
            return "Room not found";
        }
    }




}
