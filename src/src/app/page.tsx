"use client";

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { GameBoard } from '@/components/GameBoard';
import { GameStatus } from '@/components/GameStatus';
import { NewGameButton } from '@/components/NewGameButton';

type GameState = {
  board: any[][];
  current_turn: 'Black' | 'White';
  black_score: number;
  white_score: number;
  game_over: boolean;
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validMoves, setValidMoves] = useState<Array<{ row: number; col: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  // Initialize or reset the game
  const initializeGame = async () => {
    try {
      const newGameState = await invoke<GameState>('new_game');
      setGameState(newGameState);
      await fetchValidMoves();
      setLoading(false);
    } catch (err) {
      setError('Failed to initialize game');
      console.error('Failed to initialize game:', err);
    }
  };

  // Fetch valid moves from the backend
  const fetchValidMoves = async () => {
    try {
      const moves = await invoke<Array<{ row: number; col: number }>>('get_valid_moves');
      setValidMoves(moves);
    } catch (err) {
      setError('Failed to fetch valid moves');
      console.error('Failed to fetch valid moves:', err);
    }
  };

  // Handle cell click to make a move
  const handleCellClick = async (row: number, col: number) => {
    if (!gameState || gameState.game_over) return;

    try {
      const updatedState = await invoke<GameState>('make_move', { 
        position: { row, col } 
      });
      setGameState(updatedState);
      await fetchValidMoves();
    } catch (err) {
      setError('Invalid move');
      console.error('Failed to make move:', err);
      // Error will clear after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">Error loading game</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Reversi Game</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <GameStatus 
            currentTurn={gameState.current_turn}
            blackScore={gameState.black_score}
            whiteScore={gameState.white_score}
            gameOver={gameState.game_over}
          />
          <GameBoard 
            board={gameState.board}
            validMoves={validMoves}
            onCellClick={handleCellClick}
            disabled={gameState.game_over}
          />
          <NewGameButton 
            onClick={initializeGame}
          />
        </div>
      </div>
    </main>
  );
}
