import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn().mockImplementation((command: string, args?: any) => {
    if (command === 'get_board_state') {
      return Promise.resolve({
        board: [
          [null, null, null, null],
          [null, { White: {} }, { Black: {} }, null],
          [null, { Black: {} }, { White: {} }, null],
          [null, null, null, null]
        ],
        current_turn: 'Black',
        game_over: false,
        black_score: 2,
        white_score: 2
      });
    }
    
    if (command === 'get_valid_moves') {
      return Promise.resolve([
        { row: 0, col: 2 },
        { row: 1, col: 3 },
        { row: 2, col: 0 },
        { row: 3, col: 1 }
      ]);
    }

    if (command === 'make_move') {
      return Promise.resolve({
        board: [
          [null, null, null, null],
          [null, { White: {} }, { Black: {} }, null],
          [null, { Black: {} }, { White: {} }, null],
          [null, null, null, null]
        ],
        current_turn: 'White',
        game_over: false,
        black_score: 3,
        white_score: 2
      });
    }

    if (command === 'new_game') {
      return Promise.resolve({
        board: [
          [null, null, null, null],
          [null, { White: {} }, { Black: {} }, null],
          [null, { Black: {} }, { White: {} }, null],
          [null, null, null, null]
        ],
        current_turn: 'Black',
        game_over: false,
        black_score: 2,
        white_score: 2
      });
    }
    
    return Promise.resolve(null);
  })
}));