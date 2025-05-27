package com.codeclash.codeclash.config;

import java.io.IOException;
import java.net.Socket;

public class ClientApp {
    public static void main(String[] args) {
        try {
            Socket socket = new Socket("localhost",8788);
            System.out.println("Connected to server");
            socket.close();
        }catch (IOException e){
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
}
