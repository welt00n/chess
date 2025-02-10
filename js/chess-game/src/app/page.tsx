"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Chess, type Move, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";

const PIECE_VALUES: Record<string, number> = {
	p: 100,
	n: 320,
	b: 330,
	r: 500,
	q: 900,
	k: 20000,
};

const MOBILITY_WEIGHTS: Record<string, number> = {
	p: 0.1,
	n: 0.3,
	b: 0.3,
	r: 0.5,
	q: 0.8,
	k: 0.1,
};

const PIECE_SQUARE_TABLES: Record<string, number[][]> = {
	p: [
		[0, 0, 0, 0, 0, 0, 0, 0],
		[50, 50, 50, 50, 50, 50, 50, 50],
		[10, 10, 20, 30, 30, 20, 10, 10],
		[5, 5, 10, 25, 25, 10, 5, 5],
		[0, 0, 0, 20, 20, 0, 0, 0],
		[5, -5, -10, 0, 0, -10, -5, 5],
		[5, 10, 10, -20, -20, 10, 10, 5],
		[0, 0, 0, 0, 0, 0, 0, 0],
	],
	n: [
		[-50, -40, -30, -30, -30, -30, -40, -50],
		[-40, -20, 0, 5, 5, 0, -20, -40],
		[-30, 0, 10, 15, 15, 10, 0, -30],
		[-30, 5, 15, 20, 20, 15, 5, -30],
		[-30, 0, 15, 20, 20, 15, 0, -30],
		[-30, 5, 10, 15, 15, 10, 5, -30],
		[-40, -20, 0, 0, 0, 0, -20, -40],
		[-50, -40, -30, -30, -30, -30, -40, -50],
	],
	b: [
		[-20, -10, -10, -10, -10, -10, -10, -20],
		[-10, 0, 0, 0, 0, 0, 0, -10],
		[-10, 0, 5, 10, 10, 5, 0, -10],
		[-10, 5, 5, 10, 10, 5, 5, -10],
		[-10, 0, 10, 10, 10, 10, 0, -10],
		[-10, 10, 10, 10, 10, 10, 10, -10],
		[-10, 5, 0, 0, 0, 0, 5, -10],
		[-20, -10, -10, -10, -10, -10, -10, -20],
	],
	r: [
		[0, 0, 0, 0, 0, 0, 0, 0],
		[5, 10, 10, 10, 10, 10, 10, 5],
		[-5, 0, 0, 0, 0, 0, 0, -5],
		[-5, 0, 0, 0, 0, 0, 0, -5],
		[-5, 0, 0, 0, 0, 0, 0, -5],
		[-5, 0, 0, 0, 0, 0, 0, -5],
		[-5, 0, 0, 0, 0, 0, 0, -5],
		[0, 0, 0, 5, 5, 0, 0, 0],
	],
	q: [
		[-20, -10, -10, -5, -5, -10, -10, -20],
		[-10, 0, 0, 0, 0, 0, 0, -10],
		[-10, 0, 5, 5, 5, 5, 0, -10],
		[-5, 0, 5, 5, 5, 5, 0, -5],
		[0, 0, 5, 5, 5, 5, 0, -5],
		[-10, 5, 5, 5, 5, 5, 0, -10],
		[-10, 0, 5, 0, 0, 0, 0, -10],
		[-20, -10, -10, -5, -5, -10, -10, -20],
	],
	k: [
		[-30, -40, -40, -50, -50, -40, -40, -30],
		[-30, -40, -40, -50, -50, -40, -40, -30],
		[-30, -40, -40, -50, -50, -40, -40, -30],
		[-30, -40, -40, -50, -50, -40, -40, -30],
		[-20, -30, -30, -40, -40, -30, -30, -20],
		[-10, -20, -20, -20, -20, -20, -20, -10],
		[20, 20, 0, 0, 0, 0, 20, 20],
		[20, 30, 10, 0, 0, 10, 30, 20],
	],
};

const isSquareAttacked = (gameInstance: Chess, square: Square, byColor: "w" | "b"): boolean => {
	const fenParts = gameInstance.fen().split(" ");
	fenParts[1] = byColor;
	const newFen = fenParts.join(" ");
	const tempGame = new Chess(newFen);
	const moves = tempGame.moves({ verbose: true });
	return moves.some((m: any) => m.to === square);
};

export default function Home() {
	const [game, setGame] = useState(new Chess());
	const [depth, setDepth] = useState(3);
	const [delay, setDelay] = useState(100);
	const [highlighted, setHighlighted] = useState<Record<Square, React.CSSProperties>>({} as any);
	const [evaluations, setEvaluations] = useState<Array<{ move: Move; score: number }>>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [moveHistory, setMoveHistory] = useState<string[]>([game.fen()]);
	const [moveList, setMoveList] = useState<string[]>([]);
	const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

	const allSquares = useMemo(
		() =>
			Array.from({ length: 8 }, (_, i) =>
				Array.from({ length: 8 }, (_, j) => `${String.fromCharCode(97 + j)}${8 - i}` as Square)
			).flat(),
		[]
	);

	const createGameCopy = useCallback(
		(fen?: string) => new Chess(fen || game.fen()),
		[game]
	);

	const getCurrentGameForMove = useCallback(() => {
		const fenToUse = moveHistory[currentHistoryIndex];
		return new Chess(fenToUse);
	}, [moveHistory, currentHistoryIndex]);

	const highlightMove = useCallback(
		async (move: Move) => {
			setHighlighted({
				[move.from]: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
				[move.to]: { backgroundColor: "rgba(255, 255, 0, 0.3)" },
			} as Record<Square, React.CSSProperties>);
			await new Promise((resolve) => setTimeout(resolve, delay));
			setHighlighted({} as any);
		},
		[delay]
	);

	const evaluatePosition = useCallback(
		(gameInstance: Chess) => {
			let score = 0;
			const board = gameInstance.board();

			board.forEach((row, i) => {
				row.forEach((piece, j) => {
					if (piece) {						
						score += piece.color === "w"
							? PIECE_VALUES[piece.type]
							: -PIECE_VALUES[piece.type];						
						const table = PIECE_SQUARE_TABLES[piece.type];
						const rowIndex = piece.color === "w" ? i : 7 - i;
						score += piece.color === "w" ? table[rowIndex][j] : -table[rowIndex][j];
					}
				});
			});

			allSquares.forEach((square) => {
				const piece = gameInstance.get(square);
				if (piece) {					
					const moves = gameInstance.moves({ square, verbose: true }).length;
					score += piece.color === "w"
						? moves * MOBILITY_WEIGHTS[piece.type]
						: -moves * MOBILITY_WEIGHTS[piece.type];					
					const opponent = piece.color === "w" ? "b" : "w";					
				}
			});

			return score;
		},
		[allSquares]
	);

	const minimax = useCallback(
		async (
			currentGame: Chess,
			currentDepth: number,
			maximize: boolean,
			alpha = -Infinity,
			beta = Infinity,
			visualize = true,
			startTime = Date.now()
		): Promise<{ score: number; move: Move | null }> => {
			if (
				currentDepth <= 0 ||
				currentGame.isGameOver() ||
				Date.now() - startTime > 5000
			) {
				return { score: evaluatePosition(currentGame), move: null };
			}

			const moves = currentGame.moves({ verbose: true });
			if (moves.length === 0)
				return { score: evaluatePosition(currentGame), move: null };

			let bestScore = maximize ? -Infinity : Infinity;
			let bestMove: Move | null = null;
			let localAlpha = alpha;
			let localBeta = beta;

			for (const move of moves) {
				const gameCopy = createGameCopy(currentGame.fen());
				try {
					gameCopy.move(move);
				} catch {
					continue;
				}

				if (visualize) await highlightMove(move);

				const { score } = await minimax(
					gameCopy,
					currentDepth - 1,
					!maximize,
					localAlpha,
					localBeta,
					visualize,
					startTime
				);

				if ((maximize && score > bestScore) || (!maximize && score < bestScore)) {
					bestScore = score;
					bestMove = move;
				}

				if (maximize) {
					localAlpha = Math.max(localAlpha, bestScore);
					if (localAlpha >= localBeta) break;
				} else {
					localBeta = Math.min(localBeta, bestScore);
					if (localBeta <= localAlpha) break;
				}
			}

			return { score: bestScore, move: bestMove };
		},
		[evaluatePosition, highlightMove, createGameCopy]
	);

	const makeAIMove = useCallback(async () => {
		setIsAnalyzing(true);
		try {
			const currentGameForAI = getCurrentGameForMove();
			const { move } = await minimax(currentGameForAI, depth, currentGameForAI.turn() === "w");
			if (move) {
		
				const moveResult = currentGameForAI.move(move);
				setGame(currentGameForAI);
				setMoveHistory((prev) => {
					const trimmed = prev.slice(0, currentHistoryIndex + 1);
					return [...trimmed, currentGameForAI.fen()];
				});
				setMoveList((prev) => [...prev, moveResult?.san || ""]);
				setCurrentHistoryIndex((prev) => prev + 1);
			}
		} finally {
			setIsAnalyzing(false);
		}
	}, [minimax, depth, getCurrentGameForMove, currentHistoryIndex]);

	const evaluateMoves = useCallback(async () => {
		setIsAnalyzing(true);
		try {
			const currentGameForEval = getCurrentGameForMove();
			const moves = currentGameForEval.moves({ verbose: true });
			const evaluated: Array<{ move: Move; score: number }> = [];

			for (const move of moves) {
				const tempGame = createGameCopy(currentGameForEval.fen());
				tempGame.move(move);
				const { score } = await minimax(
					tempGame,
					depth - 1,
					tempGame.turn() === "w",
					-Infinity,
					Infinity,
					false
				);
				evaluated.push({ move, score });
				await highlightMove(move);
			}

			evaluated.sort((a, b) =>
				currentGameForEval.turn() === "w" ? b.score - a.score : a.score - b.score
			);
			setEvaluations(evaluated);
		} finally {
			setIsAnalyzing(false);
		}
	}, [minimax, depth, highlightMove, createGameCopy, getCurrentGameForMove]);

	const onDrop = useCallback(
		(source: Square, target: Square) => {
			const currentGameForMove = getCurrentGameForMove();
			try {
				const moveResult = currentGameForMove.move({ from: source, to: target, promotion: "q" });
				setGame(currentGameForMove);
				setMoveHistory((prev) => {
					const trimmed = prev.slice(0, currentHistoryIndex + 1);
					return [...trimmed, currentGameForMove.fen()];
				});
				setMoveList((prev) => [...prev, moveResult?.san || ""]);
				setCurrentHistoryIndex((prev) => prev + 1);
				return true;
			} catch {
				return false;
			}
		},
		[getCurrentGameForMove, currentHistoryIndex]
	);

	const displayedFen = moveHistory[currentHistoryIndex] || game.fen();

	const goToFirst = () => setCurrentHistoryIndex(0);
	const goToPrevious = () => setCurrentHistoryIndex((i) => (i > 0 ? i - 1 : i));
	const goToNext = () => setCurrentHistoryIndex((i) => (i < moveHistory.length - 1 ? i + 1 : i));
	const goToLast = () => setCurrentHistoryIndex(moveHistory.length - 1);

	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="bg-gray-800 rounded-lg shadow-lg p-4">
					<Chessboard
						position={displayedFen}
						onPieceDrop={onDrop}
						customSquareStyles={highlighted}
						boardWidth={560}
					/>
				</div>

				<div className="bg-gray-800 rounded-lg shadow-lg p-4">
					<div className="flex flex-col md:flex-row gap-4">

						<div className="flex flex-col items-center">
							<div className="flex gap-2 mb-2">
								<button
									onClick={goToFirst}
									disabled={currentHistoryIndex === 0}
									className="px-3 py-1 bg-indigo-600 rounded disabled:opacity-50"
								>
									First
								</button>
								<button
									onClick={goToPrevious}
									disabled={currentHistoryIndex === 0}
									className="px-3 py-1 bg-indigo-600 rounded disabled:opacity-50"
								>
									Prev
								</button>
								<button
									onClick={goToNext}
									disabled={currentHistoryIndex === moveHistory.length - 1}
									className="px-3 py-1 bg-indigo-600 rounded disabled:opacity-50"
								>
									Next
								</button>
								<button
									onClick={goToLast}
									disabled={currentHistoryIndex === moveHistory.length - 1}
									className="px-3 py-1 bg-indigo-600 rounded disabled:opacity-50"
								>
									Last
								</button>
							</div>
							<div>
								<span>
									Move {currentHistoryIndex} of {moveHistory.length - 1}
								</span>
							</div>
						</div>


						<div className="flex-1 bg-gray-700 rounded p-4 overflow-auto max-h-60">
							<h3 className="text-lg font-bold mb-2">Move List</h3>
							<ol className="list-decimal ml-6 space-y-1">
								{moveList.map((san, index) => (
									<li key={index} className={index === currentHistoryIndex - 1 ? "text-indigo-400" : ""}>
										{san}
									</li>
								))}
							</ol>
						</div>
					</div>
				</div>

				<div className="bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
					<div className="space-y-2">
						<label className="block">
							<span className="text-gray-300">Search Depth: {depth}</span>
							<input
								type="range"
								min="1"
								max="5"
								value={depth}
								onChange={(e) => setDepth(Number(e.target.value))}
								className="w-full mt-1"
							/>
						</label>
						<label className="block">
							<span className="text-gray-300">Visualization Delay: {delay}ms</span>
							<input
								type="range"
								min="0"
								max="500"
								value={delay}
								onChange={(e) => setDelay(Number(e.target.value))}
								className="w-full mt-1"
							/>
						</label>
					</div>
					<div className="flex gap-4 flex-wrap">
						<button
							onClick={makeAIMove}
							disabled={isAnalyzing}
							className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
						>
							{isAnalyzing ? "Analyzing..." : "Play Best Move"}
						</button>
						<button
							onClick={evaluateMoves}
							disabled={isAnalyzing}
							className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
						>
							{isAnalyzing ? "Analyzing..." : "Show Best Moves"}
						</button>
						<button
							onClick={() => {
								const newGame = new Chess();
								setGame(newGame);
								setMoveHistory([newGame.fen()]);
								setMoveList([]);
								setCurrentHistoryIndex(0);
							}}
							className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
						>
							New Game
						</button>
					</div>
				</div>

				{evaluations.length > 0 && (
					<div className="bg-gray-800 rounded-lg shadow-lg p-4">
						<h3 className="text-lg font-bold mb-2">Top Moves (Evaluations)</h3>
						<div className="space-y-2">
							{evaluations.map(({ move, score }, index) => (
								<div
									key={index}
									className="flex justify-between items-center bg-gray-700 p-2 rounded"
								>
									<span className="font-medium">{move.san}</span>
									<span className={`font-semibold ${score > 0 ? "text-green-400" : "text-red-400"}`}>
										{score.toFixed(1)}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
