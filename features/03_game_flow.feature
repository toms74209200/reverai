Feature: Game Flow
  As a player
  I want the game to follow Reversi rules
  So that I can experience a complete game

  Scenario: Skipping a player's turn when no valid moves
    Given it is the current player's turn
    When there are no valid moves for the current player
    Then their turn should be skipped
    And it should become the opponent's turn
    And a message should inform that the turn was skipped

  Scenario: Game Over
    Given neither player has valid moves
    Then the game should end
    And the winner should be determined
    And the final score should be displayed
    And an option to start a new game should be available

  Scenario: Starting a new game
    Given the game has ended
    When I choose to start a new game
    Then the board should reset to the initial state
    And it should be black's turn
    And the score should reset