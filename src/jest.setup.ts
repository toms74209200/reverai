import '@testing-library/jest-dom';

// Mock the Tauri invoke function
jest.mock('@tauri-apps/api/tauri', () => ({
  invoke: jest.fn().mockImplementation((command, args) => {
    // Default mock implementation for invoke
    if (command === 'get_board_state') {
      return {
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
      };
    }
    
    if (command === 'get_valid_moves') {
      return [
        { row: 0, col: 2 },
        { row: 1, col: 3 },
        { row: 2, col: 0 },
        { row: 3, col: 1 }
      ];
    }
    
    return null;
  })
}));