import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../GameState';

/**
 * This test file implements the scenarios from 01_game_board.feature using a BDD approach
 * Feature: Game Board
 * As a player
 * I want a 4x4 game board
 * So that I can play a simplified version of Reversi
 */
describe('Feature: Game Board', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Scenario: Initial board setup', () => {
    it('Given the game has started', () => {
      // This is handled by beforeEach
      expect(gameState).toBeDefined();
    });

    it('Then the board should be a 4x4 grid', () => {
      const board = gameState.getBoard();
      expect(board.length).toBe(4);
      board.forEach(row => {
        expect(row.length).toBe(4);
      });
    });

    it('And the board should have 2 black pieces and 2 white pieces in the center', () => {
      const board = gameState.getBoard();
      
      // Check center pieces
      expect(board[1][1]).toEqual({ White: {} });
      expect(board[1][2]).toEqual({ Black: {} });
      expect(board[2][1]).toEqual({ Black: {} });
      expect(board[2][2]).toEqual({ White: {} });
      
      // Count total pieces
      const { black, white } = gameState.getScores();
      expect(black).toBe(2);
      expect(white).toBe(2);
    });

    it('And it should be black\'s turn', () => {
      expect(gameState.getCurrentTurn()).toBe('Black');
    });
  });

  describe('Scenario: Viewing the board', () => {
    it('Given the game has started', () => {
      // This is handled by beforeEach
      expect(gameState).toBeDefined();
    });

    it('Then each cell should be visually distinct', () => {
      const board = gameState.getBoard();
      
      // Check that board cells are defined
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(board[row][col] !== undefined).toBe(true);
        }
      }
    });

    it('And occupied cells should display the appropriate piece', () => {
      const board = gameState.getBoard();
      
      // Check that occupied cells have pieces
      expect(board[1][1]).toEqual({ White: {} });
      expect(board[1][2]).toEqual({ Black: {} });
      expect(board[2][1]).toEqual({ Black: {} });
      expect(board[2][2]).toEqual({ White: {} });
      
      // Check that other cells are null (unoccupied)
      expect(board[0][0]).toBeNull();
      expect(board[0][1]).toBeNull();
      expect(board[3][3]).toBeNull();
    });

    it('And the current score should be displayed', () => {
      const { black, white } = gameState.getScores();
      expect(black).toBe(2);
      expect(white).toBe(2);
    });

    it('And the current player\'s turn should be displayed', () => {
      expect(gameState.getCurrentTurn()).toBe('Black');
    });
  });
});