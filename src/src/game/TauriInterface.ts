import { invoke } from '@tauri-apps/api/tauri';

export type PieceColor = 'Black' | 'White';
export type Position = { row: number; col: number };

// GameStateの型定義をバックエンドの出力形式に合わせる
export interface GameState {
  board: Array<Array<Option<string>>>;
  current_turn: string;
  game_over: boolean;
  black_score: number;
  white_score: number;
}

// Option型の定義（TypeScriptにはないので）
export type Option<T> = T | null;

// 関数をバックエンドと整合させる
export async function newGame(): Promise<GameState> {
  return invoke('new_game');
}

export async function makeMove(position: Position): Promise<GameState> {
  return invoke('make_move', { position });
}

export async function getValidMoves(): Promise<Position[]> {
  return invoke('get_valid_moves');
}

// デバッグ用のモック実装
export const mockTauriInterface = {
  newGame: async (): Promise<GameState> => {
    const emptyCell = null;
    const blackCell = "Black";
    const whiteCell = "White";
    
    return {
      board: [
        [emptyCell, emptyCell, emptyCell, emptyCell],
        [emptyCell, whiteCell, blackCell, emptyCell],
        [emptyCell, blackCell, whiteCell, emptyCell],
        [emptyCell, emptyCell, emptyCell, emptyCell]
      ],
      current_turn: "Black",
      game_over: false,
      black_score: 2,
      white_score: 2
    };
  },
  
  makeMove: async (position: Position): Promise<GameState> => {
    console.log("Mock move at:", position);
    return mockTauriInterface.newGame(); // 簡易的な実装
  },
  
  getValidMoves: async (): Promise<Position[]> => {
    return [
      { row: 0, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 0 },
      { row: 3, col: 1 }
    ];
  }
};