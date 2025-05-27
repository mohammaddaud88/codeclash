package com.codeclash.codeclash.controller;


import com.codeclash.codeclash.dto.RoomRequestDto;
import com.codeclash.codeclash.model.Room;
import com.codeclash.codeclash.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://192.168.9.100:3000", originPatterns = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/room/create")
    public String createRoom(@RequestBody Room room){
        String roomCode = roomService.createRoom(room);
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


    @GetMapping("/room/getById")
    public Room getById(@RequestParam String roomCode){
        return roomService.getRoom(roomCode);
    }




}
