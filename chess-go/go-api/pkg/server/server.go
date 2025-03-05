package server

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
    "chess-api/config"
    "chess-api/pkg/database"
)

type Server struct {
    httpServer *http.Server
}

func New(cfg *config.Config) *Server {
    mux := http.NewServeMux()
    
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK, we fine"))
    })

    mux.HandleFunc("/moves", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }

        events, err := database.GetAllMoves()
        if err != nil {
            log.Printf("Error getting moves: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        if err := json.NewEncoder(w).Encode(events); err != nil {
            log.Printf("Error encoding response: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
    })

    return &Server{
        httpServer: &http.Server{
            Addr:    fmt.Sprintf(":%d", cfg.HTTPPort),
            Handler: mux,
        },
    }
}

func (s *Server) Start() error {
    log.Printf("HTTP server starting on port %s", s.httpServer.Addr)
    return s.httpServer.ListenAndServe()
}

func (s *Server) Stop() {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    if err := s.httpServer.Shutdown(ctx); err != nil {
        log.Printf("HTTP server shutdown error: %v", err)
    }
}