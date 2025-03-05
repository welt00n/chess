'use client';
import Board from './components/board';
import GameNavigator from './components/game-navigator';
import useChessEngine from './hooks/useChessEngine';

export default function Home() {
  const {
    games,
    currentGameFEN,
    currentPositionIndex,
    totalMoves,
    currentGameId,
    newGame,
    deleteGame,
    makeMove,
    undo,
    redo,
    setCurrentGameId
  } = useChessEngine();

  return (
    <div className="min-h-screen">     
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 gap-8 max-w-5xl">
        <Board
          key={currentGameId}
          fen={currentGameFEN}
          currentPosition={currentPositionIndex}
          totalMoves={totalMoves}
          onDrop={makeMove}
          redoMove={redo}
          undoMove={undo}
          newGame={newGame}
        />
        
        <GameNavigator
          games={games}
          currentGameId={currentGameId}
          onSelectGame={setCurrentGameId}
          onDeleteGame={deleteGame}
        />
      </main>
      <footer className="p-4 text-center mt-8">
        <p className="text-sm">Play chess! ♟️</p>
      </footer>
    </div>
  );
}