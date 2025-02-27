import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Initial board setup', () => {
    it('should create a 4x4 grid', () => {
      const board = gameState.getBoard();
      expect(board.length).toBe(4);
      board.forEach(row => {
        expect(row.length).toBe(4);
      });
    });

    it('should have initial pieces in correct positions', () => {
      const board = gameState.getBoard();
      
      // Check center pieces
      expect(board[1][1]).toEqual({ White: {} });
      expect(board[1][2]).toEqual({ Black: {} });
      expect(board[2][1]).toEqual({ Black: {} });
      expect(board[2][2]).toEqual({ White: {} });

      // Check other cells are empty
      expect(board[0][0]).toBeNull();
      expect(board[0][1]).toBeNull();
      expect(board[3][3]).toBeNull();
    });

    it('should start with Black\'s turn', () => {
      expect(gameState.getCurrentTurn()).toBe('Black');
    });

    it('should initialize with correct scores', () => {
      const { black, white } = gameState.getScores();
      expect(black).toBe(2);
      expect(white).toBe(2);
    });

    it('should not be in game over state initially', () => {
      expect(gameState.isGameOver()).toBe(false);
    });
  });

  describe('Board immutability', () => {
    it('should return a copy of the board', () => {
      const board1 = gameState.getBoard();
      const board2 = gameState.getBoard();
      
      // Boards should be equal but not the same object
      expect(board1).toEqual(board2);
      expect(board1).not.toBe(board2);
      
      // Modifying returned board should not affect internal state
      board1[1][1] = null;
      const board3 = gameState.getBoard();
      expect(board3[1][1]).toEqual({ White: {} });
    });
  });

  describe('Score tracking', () => {
    it('should correctly report initial scores', () => {
      const { black, white } = gameState.getScores();
      expect(black).toBe(2);
      expect(white).toBe(2);
    });
  });

  describe('Game Moves', () => {
    describe('Valid moves', () => {
      it('should return valid moves for initial board state', () => {
        const validMoves = gameState.getValidMoves();
        expect(validMoves).toHaveLength(4);
        expect(validMoves).toContainEqual({ row: 0, col: 2 });
        expect(validMoves).toContainEqual({ row: 1, col: 3 });
        expect(validMoves).toContainEqual({ row: 2, col: 0 });
        expect(validMoves).toContainEqual({ row: 3, col: 1 });
      });

      it('should successfully make a valid move', () => {
        const initialScores = gameState.getScores();
        const result = gameState.makeMove({ row: 1, col: 3 });
        
        expect(result).toBe(true);
        expect(gameState.getCurrentTurn()).toBe('White');
        
        const board = gameState.getBoard();
        expect(board[1][3]).toEqual({ Black: {} });
        
        const newScores = gameState.getScores();
        expect(newScores.black).toBeGreaterThan(initialScores.black);
      });

      it('should flip opponent pieces when making a move', () => {
        gameState.makeMove({ row: 1, col: 3 }); // Black's move
        const board = gameState.getBoard();
        
        // Verify the placed piece
        expect(board[1][3]).toEqual({ Black: {} });
        // Verify flipped pieces
        expect(board[1][2]).toEqual({ Black: {} });
      });
    });

    describe('Invalid moves', () => {
      it('should reject moves to occupied cells', () => {
        const result = gameState.makeMove({ row: 1, col: 1 });
        expect(result).toBe(false);
        expect(gameState.getCurrentTurn()).toBe('Black');
      });

      it('should reject moves that dont flip any pieces', () => {
        const result = gameState.makeMove({ row: 0, col: 0 });
        expect(result).toBe(false);
        expect(gameState.getCurrentTurn()).toBe('Black');
      });

      it('should not change scores on invalid move', () => {
        const initialScores = gameState.getScores();
        gameState.makeMove({ row: 0, col: 0 });
        const newScores = gameState.getScores();
        expect(newScores).toEqual(initialScores);
      });

      it('should reject moves outside the board', () => {
        const result = gameState.makeMove({ row: 4, col: 0 });
        expect(result).toBe(false);
        expect(gameState.getCurrentTurn()).toBe('Black');
      });
    });
  });

  describe('Turn Management', () => {
    it('should alternate turns after valid moves', () => {
      expect(gameState.getCurrentTurn()).toBe('Black');
      gameState.makeMove({ row: 1, col: 3 }); // Valid move for Black
      expect(gameState.getCurrentTurn()).toBe('White');
    });

    it('should maintain turn on invalid moves', () => {
      expect(gameState.getCurrentTurn()).toBe('Black');
      gameState.makeMove({ row: 0, col: 0 }); // Invalid move
      expect(gameState.getCurrentTurn()).toBe('Black');
    });
  });

  describe('Game Progress', () => {
    it('should update scores after valid moves', () => {
      const initialScores = gameState.getScores();
      gameState.makeMove({ row: 1, col: 3 }); // Valid move that flips pieces
      const newScores = gameState.getScores();
      
      expect(newScores.black).toBeGreaterThan(initialScores.black);
      expect(newScores.black + newScores.white).toBeGreaterThan(
        initialScores.black + initialScores.white
      );
    });

    it('should maintain consistent piece count and scores', () => {
      gameState.makeMove({ row: 1, col: 3 });
      const scores = gameState.getScores();
      
      // Count pieces on board manually
      let blackCount = 0;
      let whiteCount = 0;
      const board = gameState.getBoard();
      
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const cell = board[row][col];
          if (cell) {
            if ('Black' in cell) blackCount++;
            if ('White' in cell) whiteCount++;
          }
        }
      }
      
      expect(scores.black).toBe(blackCount);
      expect(scores.white).toBe(whiteCount);
    });
  });

  describe('Game Flow', () => {
    describe('Turn skipping', () => {
      it('should skip turn when player has no valid moves', () => {
        // Create a board state where the current player has no valid moves
        // but the opponent does
        const customBoard = [
          [{ Black: {} }, { Black: {} }, { Black: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [null, { Black: {} }, { Black: {} }, { Black: {} }],
        ];
        
        // Set up this specific board state
        (gameState as any).board = customBoard;
        (gameState as any).currentTurn = 'White';
        gameState.makeMove({ row: 3, col: 0 }); // The only valid move for White
        
        // Now White should have no valid moves and their turn should be skipped
        expect(gameState.getCurrentTurn()).toBe('Black');
        expect(gameState.getValidMoves().length).toBeGreaterThan(0);
      });
    });

    describe('Game Over', () => {
      it('should detect when game is over (no valid moves for either player)', () => {
        // Create a board state where neither player has valid moves
        const customBoard = [
          [{ Black: {} }, { Black: {} }, { Black: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [{ Black: {} }, { Black: {} }, { Black: {} }, { Black: {} }],
        ];
        
        // Set up this specific board state
        (gameState as any).board = customBoard;
        (gameState as any).currentTurn = 'White';
        (gameState as any).updateScores();
        
        // Verify game over state
        expect(gameState.isGameOver()).toBe(true);
      });

      it('should determine winner based on final score', () => {
        // Create a board state where Black has more pieces
        const customBoard = [
          [{ Black: {} }, { Black: {} }, { Black: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [{ Black: {} }, { White: {} }, { White: {} }, { Black: {} }],
          [{ Black: {} }, { Black: {} }, { Black: {} }, { Black: {} }],
        ];
        
        // Set up this specific board state
        (gameState as any).board = customBoard;
        (gameState as any).updateScores();
        
        const { black, white } = gameState.getScores();
        expect(black).toBeGreaterThan(white);
      });
    });

    describe('Game Reset', () => {
      it('should reset to initial state', () => {
        // First, make some moves to change the game state
        gameState.makeMove({ row: 1, col: 3 });
        gameState.makeMove({ row: 0, col: 2 });
        
        // Then create a new game state
        const newGameState = new GameState();
        
        // Verify the new game state matches initial conditions
        expect(newGameState.getCurrentTurn()).toBe('Black');
        expect(newGameState.getScores()).toEqual({ black: 2, white: 2 });
        expect(newGameState.isGameOver()).toBe(false);
        
        const board = newGameState.getBoard();
        expect(board[1][1]).toEqual({ White: {} });
        expect(board[1][2]).toEqual({ Black: {} });
        expect(board[2][1]).toEqual({ Black: {} });
        expect(board[2][2]).toEqual({ White: {} });
      });
    });

    describe('Game State Consistency', () => {
      it('should maintain valid game state after multiple moves', () => {
        const moves: Array<[number, number]> = [
          [1, 3], [0, 2], [3, 1], [2, 0]
        ];
        
        // Execute sequence of moves
        moves.forEach(([row, col]) => {
          const beforeScores = gameState.getScores();
          const beforeTurn = gameState.getCurrentTurn();
          
          gameState.makeMove({ row, col });
          
          const afterScores = gameState.getScores();
          
          // Verify game state consistency
          expect(afterScores.black + afterScores.white).toBeGreaterThanOrEqual(
            beforeScores.black + beforeScores.white
          );
          expect(gameState.getCurrentTurn()).not.toBe(beforeTurn);
        });
      });

      it('should properly track captured pieces', () => {
        gameState.makeMove({ row: 1, col: 3 }); // Black's move that flips White pieces
        const scores = gameState.getScores();
        
        // After this move, Black should have more pieces than White
        expect(scores.black).toBeGreaterThan(scores.white);
        
        // Total number of pieces should make sense
        expect(scores.black + scores.white).toBeLessThanOrEqual(16); // 4x4 board
      });
    });
  });
});