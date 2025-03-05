import { Chess, Square } from 'chess.js';
export interface GameSummary {
  startTime: number;
  moveCount: number;
}
type GameEvent =
  {
    event_type: 'move',
    game_id: string,
    fen: string,
    move_from?: string,
    move_to?: string,
    timestamp: string
  } |
  {
    event_type: 'delete',
    game_id: string,
    timestamp: string
  };
class ChessGame {
  readonly startTime: number;
  history: string[];
  currentPositionIndex: number;
  constructor(initialFEN?: string, startTime?: number) {
    const initial = initialFEN || new Chess().fen();
    this.startTime = startTime || Date.now();
    this.history = [initial];
    this.currentPositionIndex = 0;
  }

  get currentFEN(): string {
    return this.history[this.currentPositionIndex];
  }

  get initialFEN(): string {
    return this.history[0];
  }

  get moveCount(): number {
    return this.history.length - 1;
  }

  truncateHistory() {
    if (this.currentPositionIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentPositionIndex + 1);
    }
  }

  applyMove(moveFn: (chess: Chess) => Chess) {
    // this.truncateHistory();
    const chess = new Chess(this.currentFEN);
    const updated = moveFn(chess);
    this.history.push(updated.fen());
    this.currentPositionIndex++;
  }

  canUndo(): boolean {
    return this.currentPositionIndex > 0;
  }

  canRedo(): boolean {
    return this.currentPositionIndex < this.history.length - 1;
  }

  cloneFromPosition(): ChessGame {
    const newGame = new ChessGame(this.currentFEN);
    newGame.history = [...this.history.slice(0, this.currentPositionIndex + 1)];
    newGame.currentPositionIndex = this.currentPositionIndex;
    return newGame;
  }
}
export class ChessEngine {
  private games: ChessGame[] = [];
  constructor() {
    this.ensureDefaultGame();    
  }
  newGame(): number {
    const game = new ChessGame();
    this.games.push(game);
    this.queueGameEvents(game);
    return game.startTime;
  }
  getGame(startTime: number): ChessGame | undefined {
    return this.games.find(g => g.startTime === startTime);
  }
  getAllGames(): GameSummary[] {
    return this.games
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .reverse()
      .map(game => ({
        startTime: game.startTime,
        moveCount: game.moveCount
    }));
  }
  deleteGame(startTime: number): void {
    const game = this.games.find(g => g.startTime == startTime);
    if (game) {
      this.games = this.games.filter(g => g.startTime !== startTime);
      this.sendEvent({
        event_type: 'delete',
        game_id: game.startTime.toString(),
        timestamp: new Date().toISOString()
      });
      this.ensureDefaultGame();
    }
  }
  makeMove(startTime: number, source: string, target: string): { success: boolean, newGameId?: number } {
    const originalGame = this.getGame(startTime);
    if (!originalGame) return { success: false };
    try {
      if (originalGame.canRedo()) {
        return this.handleBranchingMove(originalGame, source, target);
      }
      originalGame.applyMove(chess => {
        const move = this.createMoveConfig(chess, source as Square, target);
        const result = chess.move(move);
        if (!result) throw new Error('Invalid move');
        return chess;
      });
      this.queueMoveEvent(originalGame, originalGame.currentFEN, source, target);
      return { success: true };
    } catch (error) {
      console.info('Move failed:', error);
      return { success: false };
    }
  }
  undoMove(startTime: number): boolean {
    const game = this.getGame(startTime);
    if (!game?.canUndo()) return false;

    game.currentPositionIndex--;
    return true;
  }
  redoMove(startTime: number): boolean {
    const game = this.getGame(startTime);
    if (!game?.canRedo()) return false;

    game.currentPositionIndex++;
    return true;
  }
  getCurrentFEN(startTime: number): string {
    return this.getGame(startTime)?.currentFEN || '';
  }
  private ensureDefaultGame() {
    if (this.games.length === 0) {
      this.newGame();
    }
  }
  private handleBranchingMove(originalGame: ChessGame, source: string, target: string) {
    const newGame = originalGame.cloneFromPosition();

    newGame.applyMove(chess => {
      const move = this.createMoveConfig(chess, source as Square, target);
      const result = chess.move(move);
      if (!result) throw new Error('Invalid move');
      return chess;
    });

    this.queueGameEvents(newGame);
    this.games.push(newGame);

    return {
      success: true,
      newGameId: newGame.startTime
    };
  }

  private createMoveConfig(chess: Chess, source: Square, target: string) {
    const piece = chess.get(source);
    const config: { from: string; to: string; promotion?: string } = {
      from: source,
      to: target
    };

    if (piece?.type === 'p') {
      const targetRank = parseInt(target[1]);
      if ((piece.color === 'w' && targetRank === 8) ||
        (piece.color === 'b' && targetRank === 1)) {
        config.promotion = 'q';
      }
    }

    return config;
  }
  private queueGameEvents(game: ChessGame, source?: string, target?: string) {
    for (let i = 1; i < game.history.length; i++) {
      const previousFen = game.history[i - 1];
      const currentFen = game.history[i];
      const move = this.findMoveBetweenFens(previousFen, currentFen);
      if (move) {
        this.queueMoveEvent(game, game.history[i], move.from, move.to);
      } else {
        console.error(`No move found between FEN positions ${i - 1} and ${i}`);
      }
    }
  }

  private findMoveBetweenFens(previousFen: string, currentFen: string): { from: string; to: string } | null {
    const chess = new Chess(previousFen);
    const moves = chess.moves({ verbose: true });

    for (const move of moves) {
      chess.move(move);
      const fenAfterMove = chess.fen().split(' ')[0];
      const targetFen = currentFen.split(' ')[0];

      if (fenAfterMove === targetFen) {
        return { from: move.from, to: move.to };
      }
      chess.undo();
    }

    return null;
  }
  private queueMoveEvent(game: ChessGame, fen: string, source?: string, target?: string) {
    this.sendEvent({
      event_type: 'move',
      game_id: game.startTime.toString(),
      fen: fen,
      move_from: source,
      move_to: target,
      timestamp: new Date().toISOString()
    });
  }

  private async sendEvent(event: GameEvent) {
    try {
      console.log("Sending event:", JSON.stringify(event, null, 2));
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error(`Event ${event.event_type} failed:`, error);
    }
  }
  async fetchGames() {
    try {
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Failed to fetch');
        const events: GameEvent[] = await response.json();
        console.log("GOOOT EVENTSS", events)
        if (events) {
          events
              .filter((item) => item.event_type == 'move')
              .sort((a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
              .forEach(moveEvent => {
                console.log("iterating move event: ", moveEvent)
                const gameId = Number(moveEvent.game_id)
                const game = this.getGame(gameId) || new ChessGame(undefined, gameId)
                console.log("GOt game", game)
                game.history.push(moveEvent.fen);
                game.currentPositionIndex = game.history.length - 1;
                if (!this.games.includes(game)) {
                  console.log("includes")
                  this.games = [...this.games, game]
                }
              });
        }
    } catch (error) {
        console.error('Error loading games:', error);
    }
  }
}