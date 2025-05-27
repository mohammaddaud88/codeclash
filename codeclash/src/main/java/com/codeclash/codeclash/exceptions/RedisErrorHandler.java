package com.codeclash.codeclash.exceptions;

import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisCommandExecutionException;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;

public class RedisErrorHandler{

    public static void main(String[] args) {

        RedisClient redisClient = RedisClient.create("redis://localhost:6379");
        try (StatefulRedisConnection<String, String> connection = redisClient.connect()) {

            RedisCommands<String, String> commands = connection.sync();

            try {
                commands.set("key", "value");
                System.out.println("Data saved successfully");
            } catch (RedisCommandExecutionException e) {
                handleRedisPersistenceIssue(e);
            }

        } finally {
            redisClient.shutdown();
        }
    }

    static void handleRedisPersistenceIssue(Exception e) {
        if (e.getMessage().contains("MISCONF")) {
            System.err.println("Redis persistence issue detected! Details: " + e.getMessage());
            System.err.println("Please check Redis persistence configuration, disk space, and permissions.");
            // consider triggering alerts or failover mechanisms here instead of merely logging
        } else {
            e.printStackTrace();
        }
    }
}