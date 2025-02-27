Feature: Game Moves
  As a player
  I want to place pieces on the board
  So that I can capture my opponent's pieces

  Scenario: Making a valid move
    Given it is black's turn
    When I click on a valid cell
    Then a black piece should be placed on that cell
    And any flanked white pieces should be flipped to black
    And it should become white's turn
    And the score should be updated

  Scenario: Attempting an invalid move
    Given it is black's turn
    When I click on an invalid cell
    Then no piece should be placed
    And no pieces should be flipped
    And it should still be black's turn
    And the score should remain unchanged

  Scenario: Highlighting valid moves
    Given it is the current player's turn
    Then all valid moves should be highlighted on the board
    And invalid positions should not be highlighted