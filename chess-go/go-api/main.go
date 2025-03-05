package main

import (
    "context"
    "log"
    "os"
    "os/signal"
    "sync"
    "syscall"
    
    "chess-api/config"
    "chess-api/pkg/database"
    "chess-api/pkg/kafka"
    "chess-api/pkg/server"
)

func main() {    
    cfg := config.Load()

    if err := database.Init(cfg.PostgresDSN); err != nil {
        log.Fatalf("Database initialization failed: %v", err)
    }
    defer database.Close()
    
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()    

    var wg sync.WaitGroup
    for i := 0; i < cfg.ConsumerWorkers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            log.Printf("Starting worker %d", workerID)
            if err := kafka.StartConsumer(ctx, cfg, workerID); err != nil {
                log.Printf("Consumer worker %d failed: %v", workerID, err)
            }
        }(i)
    }

    httpServer := server.New(cfg)
    go func() {
        if err := httpServer.Start(); err != nil {
            log.Printf("HTTP server failed: %v", err)
            cancel()
        }
    }()

    sig := make(chan os.Signal, 1)
    signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
    <-sig

    log.Println("Shutting down...")
    cancel()
    wg.Wait()
    httpServer.Stop()
    log.Println("Shutdown completed")
}