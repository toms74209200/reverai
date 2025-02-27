import { invoke } from '@tauri-apps/api/tauri';

export type PieceColor = 'Black' | 'White';
export type Position = { row: number; col: number };
export type Cell = { Black: {} } | { White: {} } | null;
export type Board = Cell[][];

export interface GameState {
  board: Board;
  current_turn: PieceColor;
  game_over: boolean;
  black_score: number;
  white_score: number;
}

export async function getBoardState(): Promise<GameState> {
  return invoke('get_board_state');
}

export async function makeMove(position: Position): Promise<GameState> {
  return invoke('make_move', { position });
}

export async function newGame(): Promise<GameState> {
  return invoke('new_game');
}

export async function getValidMoves(): Promise<Position[]> {
  return invoke('get_valid_moves');
}