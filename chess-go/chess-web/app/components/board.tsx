'use client';
import { Chessboard } from 'react-chessboard';

interface BoardProps {
  fen: string;
  currentPosition: number;
  totalMoves: number;
  onDrop: (source: string, target: string) => boolean;
  redoMove: () => boolean;
  undoMove: () => boolean;
  newGame: () => void;
}

export default function Board({ fen, currentPosition, totalMoves, onDrop, undoMove, redoMove, newGame }: BoardProps) {
  const handleDrop = (source:string, target: string) => {
    console.log("Handling drop")
    const result = onDrop(source, target)
    console.log("reuslt:", result)
    return true
  }
  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-[640px]">
        <Chessboard
          position={fen}
          onPieceDrop={handleDrop}
          boardWidth={640}
        />
      </div>
      <div className="mt-4 flex flex-col max-w-[320px] gap-4">
        <div className="flex justify-center gap-2">
          <button
            onClick={undoMove}
            className="bg-amber-700 text-amber-50 px-4 py-2 rounded hover:bg-amber-800 disabled:opacity-50 transition-colors"
            disabled={currentPosition === 0}
          >
            Undo
          </button>
          <button
            onClick={redoMove}
            className="bg-amber-700 text-amber-50 px-4 py-2 rounded hover:bg-amber-800 disabled:opacity-50 transition-colors"
            disabled={currentPosition === totalMoves}
          >
            Redo
          </button>
        </div>
        <button
          onClick={newGame}
          className="bg-amber-700 text-amber-50 px-4 py-2 rounded"
        >
          New Game
        </button>
      </div>
    </div>
  );
}