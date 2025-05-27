package com.codeclash.codeclash.mongoConfig;

import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

public class MongoDBConnection {
    private static final Logger logger = LoggerFactory.getLogger(MongoDBConnection.class);
    private static final int MAX_RETRIES = 3;
    private static final int RETRY_DELAY_MS = 1000;

    public static MongoClient createMongoClient() {
        String host = "localhost";
        int port = 27017;
        int attempts = 0;

        while (attempts < MAX_RETRIES) {
            try {
                MongoClientSettings settings = MongoClientSettings.builder()
                        .applyToClusterSettings(builder ->
                                builder.hosts(Collections.singletonList(new ServerAddress(host, port)))
                                        .serverSelectionTimeout(5000, TimeUnit.MILLISECONDS))
                        .applyToSocketSettings(builder ->
                                builder.connectTimeout(5000, TimeUnit.MILLISECONDS)
                                        .readTimeout(5000, TimeUnit.MILLISECONDS))
                        .applyToConnectionPoolSettings(builder ->
                                builder.maxSize(50)
                                        .minSize(10)
                                        .maxWaitTime(5000, TimeUnit.MILLISECONDS)
                                        .maxConnectionLifeTime(30, TimeUnit.MINUTES))
                        .retryWrites(true)
                        .retryReads(true)
                        .build();

                MongoClient client = MongoClients.create(settings);
                // Test the connection
                client.listDatabaseNames().first();
                return client;
            } catch (MongoException e) {
                attempts++;
                logger.warn("Attempt {} failed to create MongoDB client: {}", attempts, e.getMessage());

                if (attempts == MAX_RETRIES) {
                    throw new RuntimeException("Failed to create MongoDB client after " + MAX_RETRIES + " attempts", e);
                }

                try {
                    Thread.sleep(RETRY_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Connection attempt interrupted", ie);
                }
            }
        }
        throw new RuntimeException("Failed to create MongoDB client after exhausting all retries");
    }

    public static MongoDatabase getDatabase(MongoClient mongoClient, String databaseName) {
        int attempts = 0;

        while (attempts < MAX_RETRIES) {
            try {
                MongoDatabase database = mongoClient.getDatabase(databaseName);
                // Test the connection
                database.listCollectionNames().first();
                return database;
            } catch (MongoException e) {
                attempts++;
                logger.warn("Attempt {} failed to connect to database {}: {}",
                        attempts, databaseName, e.getMessage());

                if (attempts == MAX_RETRIES) {
                    throw new RuntimeException("Failed to connect to database " +
                            databaseName + " after " + MAX_RETRIES + " attempts", e);
                }

                try {
                    Thread.sleep(RETRY_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Database connection attempt interrupted", ie);
                }
            }
        }
        throw new RuntimeException("Failed to connect to database after exhausting all retries");
    }
}