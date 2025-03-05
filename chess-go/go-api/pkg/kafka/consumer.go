package kafka

import (
    "context"
    "encoding/json"
    "log"
    "github.com/segmentio/kafka-go"
    "chess-api/config"
    "chess-api/pkg/database"
)

func StartConsumer(ctx context.Context, cfg *config.Config, workerID int) error {
    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  cfg.KafkaBrokers,
        Topic:    cfg.KafkaTopic,
        GroupID:  cfg.KafkaGroupID,
        MinBytes: 10e3,
        MaxBytes: 10e6,
    })
    defer reader.Close()

    for {
        select {
        case <-ctx.Done():
            return nil
        default:
            msg, err := reader.ReadMessage(ctx)
            if err != nil {
                return err
            }

            var event database.GameEvent
            log.Printf("Loading event %v", msg.Value)
            if err := json.Unmarshal(msg.Value, &event); err != nil {
                log.Printf("Worker %d: Message unmarshal error: %v", workerID, err)
                continue
            }
            
            log.Printf("Got event value: %+v", event)

            if event.EventType == "move" {
                if err := database.SaveEvent(event); err != nil {
                    log.Printf("Worker %d: Save event error: %v", workerID, err)
                }
            }
            if event.EventType == "delete" {
                if err := database.DeleteGameEvents(event.GameID); err != nil {
                    log.Printf("Worker %d: Delete game events error: %v", workerID, err)
                }
            }
        }
    }
}