Feature: Game Board
  As a player
  I want a 4x4 game board
  So that I can play a simplified version of Reversi

  Scenario: Initial board setup
    Given the game has started
    Then the board should be a 4x4 grid
    And the board should have 2 black pieces and 2 white pieces in the center
    And it should be black's turn

  Scenario: Viewing the board
    Given the game has started
    Then each cell should be visually distinct
    And occupied cells should display the appropriate piece
    And the current score should be displayed
    And the current player's turn should be displayed