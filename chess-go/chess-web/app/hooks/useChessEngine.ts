'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ChessEngine, GameSummary } from '../lib/chess-engine';
export default function useChessEngine() {
  const [engine] = useState(() => new ChessEngine());
  const [engineVersion, setEngineVersion] = useState(0);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [currentGameId, setCurrentGameId] = useState<number>(-1);
  const updateEngineState = useCallback(() => {
    const currentGames = engine.getAllGames();
    setGames(currentGames);
    if (!currentGames.some(g => g.startTime === currentGameId)) {
      setCurrentGameId(currentGames[0]?.startTime ?? -1);
    }

    setEngineVersion(v => v + 1);
  }, [engine, currentGameId]);
  const initializeGames = useCallback(async () => {
    const currentGames = engine.getAllGames();
    if (currentGames.length === 0) {
      const newId = engine.newGame();
      setCurrentGameId(newId);
    }
    updateEngineState();
  }, [engine, updateEngineState]);
  useEffect(() => {
    initializeGames();
  }, [initializeGames]);
  useEffect(() => {
    let isMounted = true;
    
    const loadGames = async () => {
      try {
        await engine.fetchGames();
        if (isMounted) {
          setGames(engine.getAllGames());
        }
      } catch (err) {
        console.log("error loading games:", err)
      }
    };

    loadGames();
    return () => { isMounted = false; };
  }, [engine]);
  const newGame = useCallback(() => {
    const newId = engine.newGame();
    setCurrentGameId(newId);
    updateEngineState();
  }, [engine, updateEngineState]);
  const deleteGame = useCallback((targetId: number) => {
    engine.deleteGame(targetId);
    const remainingGames = engine.getAllGames();

    if (remainingGames.length === 0) {
      const newId = engine.newGame();
      setCurrentGameId(newId);
    } else {
      setCurrentGameId(prev =>
        prev === targetId ? remainingGames[0].startTime : prev
      );
    }
    updateEngineState();
  }, [engine, updateEngineState]);
  const makeMove = useCallback((source: string, target: string) => {
    const result = engine.makeMove(currentGameId, source, target);
    if (result.success) {
      if (result.newGameId) {
        setCurrentGameId(result.newGameId);
      }
      updateEngineState();
    }
    return result.success;
  }, [engine, currentGameId, updateEngineState]);
  const undo = useCallback(() => {
    const success = engine.undoMove(currentGameId);
    if (success) updateEngineState();
    return success;
  }, [engine, currentGameId, updateEngineState]);
  const redo = useCallback(() => {
    const success = engine.redoMove(currentGameId);
    if (success) updateEngineState();
    return success;
  }, [engine, currentGameId, updateEngineState]);
  const currentGameFEN = useMemo(
    () => engine.getCurrentFEN(currentGameId),
    [engine, currentGameId, engineVersion]
  );
  const currentPositionIndex = useMemo(
    () => engine.getGame(currentGameId)?.currentPositionIndex ?? 0,
    [engine, currentGameId, engineVersion]
  );
  const totalMoves = useMemo(
    () => engine.getGame(currentGameId)?.history.length ?
      engine.getGame(currentGameId)!.history.length - 1 : 0,
    [engine, currentGameId, engineVersion]
  );
  return {
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
  };
}