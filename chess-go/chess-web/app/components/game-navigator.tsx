'use client';
import { useState } from 'react';
import { format } from 'date-fns';

interface GameNavigatorProps {
  games: { startTime: number; moveCount: number }[];
  currentGameId: number;
  onSelectGame: (startTime: number) => void;
  onDeleteGame: (startTime: number) => void;
}

export default function GameNavigator({
  games,
  currentGameId,
  onSelectGame,
  onDeleteGame,
}: GameNavigatorProps) {
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null);

  const formatGameDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, HH:mm');
  };

  const handleDeleteConfirmation = (startTime: number) => {
    setDeletingGameId(startTime);
  };

  const handleDeleteCancel = () => {
    setDeletingGameId(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingGameId) {
      onDeleteGame(deletingGameId);
      setDeletingGameId(null);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="flex items-center justify-between mb-6 w-full max-w-[280px]">
        <h2 className="text-2xl font-bold text-amber-900">Games</h2>
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
          {games.length} Games
        </span>
      </div>

      {games.length === 0 ? (
        <p className="text-amber-700 text-center py-4">No games available</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {games.map(({ startTime, moveCount }) => (
            <li
              key={startTime}
              className={`p-3 rounded-lg ${
                startTime === currentGameId
                  ? 'bg-amber-200 shadow-inner'
                  : 'bg-amber-100 hover:bg-amber-200'
              }`}
            >
              <button
                onClick={() => onSelectGame(startTime)}
                className=" text-left"
                aria-label={`Select game from ${formatGameDate(startTime)}`}
              >
                <div className="text-sm font-medium text-amber-900">
                  {formatGameDate(startTime)}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {moveCount} {moveCount === 1 ? 'move' : 'moves'}
                </div>
              </button>
              
              <button
                onClick={() => handleDeleteConfirmation(startTime)}
                className="ml-3 p-1 hover:bg-amber-300 rounded-full"
                aria-label={`Delete game from ${formatGameDate(startTime)}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {deletingGameId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-amber-50 p-6 rounded-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-amber-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-amber-700 mb-6">
              Are you sure you want to delete this game from{' '}
              {formatGameDate(deletingGameId)}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-amber-700 text-amber-50 rounded-lg hover:bg-amber-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}