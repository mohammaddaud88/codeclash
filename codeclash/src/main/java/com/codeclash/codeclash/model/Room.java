package com.codeclash.codeclash.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room implements Serializable {
    @Id
    private String roomCode;

    private String host;
    private String difficulty;
    private Set<String> players = new HashSet<>();
    public Room(String roomCode,String host){
        this.roomCode = roomCode;
        this.host = host;
        this.players.add(host);

    }

    public void addPlayer(String playerUsername){
        players.add(playerUsername);
    }
}
