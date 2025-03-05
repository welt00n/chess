package database

import (
    "context"
    "database/sql"
    "fmt"
    "time"
    _ "github.com/lib/pq"
)

var db *sql.DB

// In your database package
type GameEvent struct {
    GameID    string `json:"game_id"`
    EventType string `json:"event_type"`
    FEN       string `json:"fen"`
    MoveFrom  string `json:"move_from"`
    MoveTo    string `json:"move_to"`
    Timestamp int `json:"timestamp"`
}
func Init(dsn string) error {
    var err error
    db, err = sql.Open("postgres", dsn)
    if err != nil {
        return fmt.Errorf("database connection failed: %w", err)
    }

    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(25)
    db.SetConnMaxLifetime(5 * time.Minute)

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    if err = db.PingContext(ctx); err != nil {
        return fmt.Errorf("database ping failed: %w", err)
    }

    return createSchema()
}

func Close() {
    if db != nil {
        db.Close()
    }
}

func createSchema() error {
    _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS moves (
            id SERIAL PRIMARY KEY,
            game_id BIGINT NOT NULL,
            timestamp BIGINT NOT NULL,
            event_type TEXT NOT NULL,
            fen TEXT,
            move_from TEXT,
            move_to TEXT
        );
    `)
    return err
}

func SaveEvent(event GameEvent) error {
    tx, err := db.Begin()
    if err != nil {
        return fmt.Errorf("transaction begin failed: %w", err)
    }
    defer tx.Rollback()

    _, err = tx.Exec(`
        INSERT INTO moves (
            game_id, 
            timestamp, 
            event_type, 
            fen, 
            move_from, 
            move_to
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        event.GameID,
        event.Timestamp,
        event.EventType,
        event.FEN,
        event.MoveFrom,
        event.MoveTo,
    )
    if err != nil {
        return fmt.Errorf("move insert failed: %w", err)
    }

    return tx.Commit()
}

func DeleteGameEvents(gameId string) error {
    tx, err := db.Begin()
    if err != nil {
        return fmt.Errorf("transaction begin failed: %w", err)
    }
    defer tx.Rollback()

    _, err = tx.Exec(`delete from moves where game_id = $1`, gameId)
    if err != nil {
        return fmt.Errorf("move delete failed: %w", err)
    }

    return tx.Commit()
}

func GetAllMoves() ([]GameEvent, error) {
    rows, err := db.Query("SELECT game_id, event_type, fen, move_from, move_to, timestamp FROM moves")
    if err != nil {
        return nil, fmt.Errorf("query failed: %w", err)
    }
    defer rows.Close()

    var events []GameEvent

    for rows.Next() {
        var event GameEvent
        err := rows.Scan(&event.GameID, &event.EventType, &event.FEN, &event.MoveFrom, &event.MoveTo, &event.Timestamp)
        if err != nil {
            return nil, fmt.Errorf("scan failed: %w", err)
        }
        events = append(events, event)
    }

    if err = rows.Err(); err != nil {
        return nil, fmt.Errorf("rows error: %w", err)
    }

    return events, nil
}