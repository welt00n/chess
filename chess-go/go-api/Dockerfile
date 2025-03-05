FROM golang:1.20-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /chess-api

FROM alpine:3.17

WORKDIR /app
COPY --from=builder /chess-api /app/chess-api

EXPOSE 8080
CMD ["/app/chess-api"]