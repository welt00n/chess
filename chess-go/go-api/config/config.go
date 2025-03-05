package config

import (
    "os"
    "strconv"
    "strings"
)

type Config struct {
    KafkaBrokers    []string
    KafkaTopic      string
    KafkaGroupID    string
    PostgresDSN     string
    HTTPPort        int
    ConsumerWorkers int
}

func Load() *Config {
    return &Config{
        KafkaBrokers:    getStringSlice("KAFKA_BROKERS", []string{"kafka:9092"}),
        KafkaTopic:      getString("KAFKA_TOPIC", "chess-events"),
        KafkaGroupID:    getString("KAFKA_GROUP_ID", "chess-consumer-group"),
        PostgresDSN:     getString("POSTGRES_DSN", "postgres://chess:chesspass@postgres:5432/chess?sslmode=disable"),
        HTTPPort:        getInt("HTTP_PORT", 8080),
        ConsumerWorkers: getInt("CONSUMER_WORKERS", 3),
    }
}

func getString(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func getStringSlice(key string, defaultValue []string) []string {
    if value := os.Getenv(key); value != "" {
        return strings.Split(value, ",")
    }
    return defaultValue
}

func getInt(key string, defaultValue int) int {
    if value := os.Getenv(key); value != "" {
        if intValue, err := strconv.Atoi(value); err == nil {
            return intValue
        }
    }
    return defaultValue
}