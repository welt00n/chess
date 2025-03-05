// lib/kafka.ts
import { Kafka, Producer } from 'kafkajs';
type GameEvent = {
  event_type: 'move' | 'undo' | 'redo' | 'new_game' | 'delete_game';
  game_id: string;
  fen: string;
  move_from?: string;
  move_to?: string;
  promotion?: string;
};
const kafka_client = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'chess-webapp',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});
let producer: Producer;

export const kafka = {
  connect: async () => {
    producer = kafka_client.producer();
    await producer.connect();
  },
  disconnect: async () => {
    await producer?.disconnect();
  },
  sendEvent: async (event: GameEvent) => {
    await kafka.connect()
    const payload = {
      game_id: event.game_id,
      event_type: event.event_type,
      fen: event.fen,
      move_from: event.move_from || null,
      move_to: event.move_to || null,
      timestamp: Date.now()
    };
    console.log("Sending event:", payload);
    await producer.send({
      topic: process.env.KAFKA_TOPIC || "chess-events",
      messages: [{
        key: event.game_id,
        value: JSON.stringify(payload)
      }]
    });
    await kafka.disconnect()
  }
};