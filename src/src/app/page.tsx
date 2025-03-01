"use client";

import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { GameStatus } from '@/components/GameStatus';
import { NewGameButton } from '@/components/NewGameButton';

// モックデータの型定義
type GameState = {
  board: any[][];
  current_turn: 'Black' | 'White';
  black_score: number;
  white_score: number;
  game_over: boolean;
};

// モックのゲーム状態
const mockInitialState: GameState = {
  board: [
    [null, null, null, null],
    [null, { White: {} }, { Black: {} }, null],
    [null, { Black: {} }, { White: {} }, null],
    [null, null, null, null]
  ],
  current_turn: 'Black',
  black_score: 2,
  white_score: 2,
  game_over: false
};

// 有効な手のモックデータ
const mockValidMoves = [
  { row: 0, col: 2 },
  { row: 1, col: 3 },
  { row: 2, col: 0 },
  { row: 3, col: 1 }
];

// Tauriのinvokeが利用可能かチェックする関数を改善
const isTauriAvailable = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const { getVersion } = await import('@tauri-apps/api/app');
    await getVersion();
    return true;
  } catch (e) {
    console.warn('Tauri is not available:', e);
    return false;
  }
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validMoves, setValidMoves] = useState<Array<{ row: number; col: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previousTurn, setPreviousTurn] = useState<'Black' | 'White' | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  // Check if turn was skipped
  useEffect(() => {
    if (gameState && previousTurn && !gameState.game_over) {
      // If the turn changes from one player to the same player without the opponent's turn,
      // then the opponent's turn was skipped
      const expectedTurn = previousTurn === 'Black' ? 'White' : 'Black';
      if (gameState.current_turn !== expectedTurn) {
        setMessage(`${expectedTurn}'s turn was skipped (no valid moves)`);
        setTimeout(() => setMessage(null), 3000);
      }
    }
    if (gameState) {
      setPreviousTurn(gameState.current_turn);
    }
  }, [gameState, previousTurn]);

  // Initialize or reset the game
  const initializeGame = async () => {
    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      
      const tauriAvailable = await isTauriAvailable();
      
      if (tauriAvailable) {
        try {
          const { invoke } = await import('@tauri-apps/api/tauri');
          const newGameState = await invoke<GameState>('new_game');
          setGameState(newGameState);
          await fetchValidMoves();
          setPreviousTurn('Black');
        } catch (err) {
          console.warn('Failed to use Tauri, falling back to mock data:', err);
          useMockData();
        }
      } else {
        // Tauriが利用できない場合はモックデータを使用
        useMockData();
      }
    } catch (err) {
      setError('Failed to initialize game');
      console.error('Failed to initialize game:', err);
      // エラー時にもモックデータを使用
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // モックデータを使用する関数
  const useMockData = () => {
    console.log('Using mock data for game');
    setUsingMock(true);
    setGameState({...mockInitialState});
    setValidMoves([...mockValidMoves]);
    setLoading(false);
    setPreviousTurn('Black');
  };

  // Fetch valid moves from the backend
  const fetchValidMoves = async () => {
    try {
      if (isTauriAvailable()) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const moves = await invoke<Array<{ row: number; col: number }>>('get_valid_moves');
        setValidMoves(moves);
      }
    } catch (err) {
      setError('Failed to fetch valid moves');
      console.error('Failed to fetch valid moves:', err);
    }
  };

  // Handle cell click to make a move
  const handleCellClick = async (row: number, col: number) => {
    if (!gameState || gameState.game_over) return;
    
    try {
      setMessage(null);
      
      if (usingMock) {
        // モックの場合は簡易的な動作をシミュレート
        simulateMockMove(row, col);
      } else {
        const tauriAvailable = await isTauriAvailable();
        if (tauriAvailable) {
          const { invoke } = await import('@tauri-apps/api/tauri');
          const updatedState = await invoke<GameState>('make_move', { 
            position: { row, col } 
          });
          setGameState(updatedState);
          await fetchValidMoves();
        } else {
          throw new Error('Tauri is not available');
        }
      }
    } catch (err) {
      setError('Invalid move');
      console.error('Failed to make move:', err);
      // Error will clear after 2 seconds
      setTimeout(() => setError(null), 2000);
    }
  };

  // モックでの手の動きをシミュレート
  const simulateMockMove = (row: number, col: number) => {
    // 有効な手かチェック
    const isValid = validMoves.some(move => move.row === row && move.col === col);
    if (!isValid) {
      setError('Invalid move');
      setTimeout(() => setError(null), 2000);
      return;
    }

    // 現在の状態をコピー
    const newBoard = [...gameState!.board.map(row => [...row])];
    const currentColor = gameState!.current_turn;
    
    // 駒を配置
    newBoard[row][col] = currentColor === 'Black' ? { Black: {} } : { White: {} };
    
    // 簡易的な駒返し処理（例として、1つの方向のみ実装）
    const directions = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1],
      [0, 1], [1, -1], [1, 0], [1, 1]
    ];
    
    // 新しいゲーム状態を作成
    const newTurn = currentColor === 'Black' ? 'White' : 'Black';
    let blackCount = 0;
    let whiteCount = 0;
    
    // 駒の数を数える
    newBoard.forEach(row => {
      row.forEach(cell => {
        if (cell && 'Black' in cell) blackCount++;
        if (cell && 'White' in cell) whiteCount++;
      });
    });
    
    const newState: GameState = {
      board: newBoard,
      current_turn: newTurn,
      black_score: blackCount,
      white_score: whiteCount,
      game_over: blackCount + whiteCount === 16 || (blackCount === 0 || whiteCount === 0)
    };
    
    setGameState(newState);
    
    // 新しい有効な手を計算（簡易的に空のセルを有効とする）
    const newValidMoves = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!newBoard[r][c]) {
          newValidMoves.push({ row: r, col: c });
        }
      }
    }
    
    setValidMoves(newValidMoves);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-xl">Loading game...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading game. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
          <span className="text-black dark:text-white">リ</span>
          <span className="text-white dark:text-black bg-black dark:bg-white px-1 rounded">バ</span>
          <span className="text-black dark:text-white">ー</span>
          <span className="text-white dark:text-black bg-black dark:bg-white px-1 rounded">シ</span>
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          {usingMock && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">Running in mock mode (Tauri backend not available)</span>
            </div>
          )}
          
          {error && (
            <div 
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" 
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {message && (
            <div 
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded relative mb-4" 
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
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
        
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Reversi Game &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
