use serde::{Deserialize, Serialize};

// Define piece colors
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum PieceColor {
    Black,
    White,
}

impl PieceColor {
    // Switch the color (used for turn alternation)
    pub fn opposite(&self) -> PieceColor {
        match self {
            PieceColor::Black => PieceColor::White,
            PieceColor::White => PieceColor::Black,
        }
    }
}

// Position on the game board
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub struct Position {
    pub row: usize,
    pub col: usize,
}

// Game board representation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameBoard {
    // 4x4 board - None means empty cell
    board: [[Option<PieceColor>; 4]; 4],
    // Current player's turn
    current_turn: PieceColor,
    // Game state
    game_over: bool,
    // Score
    black_score: usize,
    white_score: usize,
}

// Direction vectors for checking valid moves
const DIRECTIONS: [(isize, isize); 8] = [
    (-1, -1),
    (-1, 0),
    (-1, 1), // Up-left, Up, Up-right
    (0, -1),
    (0, 1), // Left, Right
    (1, -1),
    (1, 0),
    (1, 1), // Down-left, Down, Down-right
];

impl GameBoard {
    // Create a new game board with initial setup
    pub fn new() -> Self {
        // Create an empty board
        let mut board = [[None; 4]; 4];

        // Set up the initial 4 pieces in the center
        // For 4x4 board, the center is at positions (1,1), (1,2), (2,1), (2,2)
        board[1][1] = Some(PieceColor::White);
        board[1][2] = Some(PieceColor::Black);
        board[2][1] = Some(PieceColor::Black);
        board[2][2] = Some(PieceColor::White);

        // Count initial pieces
        let mut game_board = GameBoard {
            board,
            current_turn: PieceColor::Black, // Black starts
            game_over: false,
            black_score: 2, // Start with 2 black pieces
            white_score: 2, // Start with 2 white pieces
        };

        game_board
    }

    // Check if a position is within the bounds of the board
    fn is_valid_position(&self, row: isize, col: isize) -> bool {
        row >= 0 && row < 4 && col >= 0 && col < 4
    }

    // Check if a move is valid according to Reversi rules
    pub fn is_valid_move(&self, position: Position) -> bool {
        let row = position.row;
        let col = position.col;

        // Position must be on the board and the cell must be empty
        if row >= 4 || col >= 4 || self.board[row][col].is_some() {
            return false;
        }

        let current_color = self.current_turn;

        // Check in all 8 directions from the position
        for (dr, dc) in DIRECTIONS {
            let mut r = row as isize + dr;
            let mut c = col as isize + dc;
            let mut found_opponent = false;

            // Continue in this direction as long as we're on the board and on opponent's pieces
            while self.is_valid_position(r, c)
                && self.board[r as usize][c as usize] == Some(current_color.opposite())
            {
                found_opponent = true;
                r += dr;
                c += dc;
            }

            // Check if we found opponent pieces and ended on one of our own pieces
            if found_opponent
                && self.is_valid_position(r, c)
                && self.board[r as usize][c as usize] == Some(current_color)
            {
                return true;
            }
        }

        false
    }

    // Get all valid moves for the current player
    pub fn get_valid_moves(&self) -> Vec<Position> {
        let mut valid_moves = Vec::new();

        // Check all positions on the board
        for row in 0..4 {
            for col in 0..4 {
                let position = Position { row, col };
                if self.is_valid_move(position) {
                    valid_moves.push(position);
                }
            }
        }

        valid_moves
    }

    // Place a piece and flip captured pieces
    pub fn place_piece(&mut self, position: Position) -> bool {
        if !self.is_valid_move(position) {
            return false;
        }

        let row = position.row;
        let col = position.col;
        let current_color = self.current_turn;

        // Place the new piece
        self.board[row][col] = Some(current_color);

        // Flip pieces in all valid directions
        for (dr, dc) in DIRECTIONS {
            let mut r = row as isize + dr;
            let mut c = col as isize + dc;
            let mut to_flip = Vec::new();

            while self.is_valid_position(r, c)
                && self.board[r as usize][c as usize] == Some(current_color.opposite())
            {
                to_flip.push((r as usize, c as usize));
                r += dr;
                c += dc;
            }

            if self.is_valid_position(r, c)
                && self.board[r as usize][c as usize] == Some(current_color)
            {
                for (fr, fc) in to_flip {
                    self.board[fr][fc] = Some(current_color);
                }
            }
        }

        // Update scores
        self.update_score();

        // Process turn change and check for game over
        self.process_turn();

        true
    }

    // Switch the current turn to the other player
    pub fn switch_turn(&mut self) {
        self.current_turn = self.current_turn.opposite();
    }

    // Update the score based on the current board state
    fn update_score(&mut self) {
        let mut black_count = 0;
        let mut white_count = 0;

        for row in 0..4 {
            for col in 0..4 {
                match self.board[row][col] {
                    Some(PieceColor::Black) => black_count += 1,
                    Some(PieceColor::White) => white_count += 1,
                    None => {}
                }
            }
        }

        self.black_score = black_count;
        self.white_score = white_count;
    }

    // Check if the current player has any valid moves
    pub fn has_valid_moves(&self) -> bool {
        for row in 0..4 {
            for col in 0..4 {
                if self.is_valid_move(Position { row, col }) {
                    return true;
                }
            }
        }
        false
    }

    // Set the game as over
    pub fn set_game_over(&mut self) {
        self.game_over = true;
    }

    // Get the winner (or None if it's a tie)
    pub fn get_winner(&self) -> Option<PieceColor> {
        if self.black_score > self.white_score {
            Some(PieceColor::Black)
        } else if self.white_score > self.black_score {
            Some(PieceColor::White)
        } else {
            None // Tie
        }
    }

    // Check if the game is over
    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    // Get the current state of the game
    pub fn get_state(&self) -> GameState {
        GameState {
            board: self.board,
            current_turn: self.current_turn,
            game_over: self.game_over,
            black_score: self.black_score,
            white_score: self.white_score,
        }
    }

    // Process turn change, including skipping if necessary
    fn process_turn(&mut self) {
        self.switch_turn();

        // If next player has no valid moves
        if !self.has_valid_moves() {
            // Switch back to check if original player has moves
            self.switch_turn();

            // If original player also has no moves, game is over
            if !self.has_valid_moves() {
                self.set_game_over();
            } else {
                // Switch back to next player and skip their turn
                self.switch_turn();
            }
        }
    }
}

// Add GameState struct for external state representation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameState {
    pub board: [[Option<PieceColor>; 4]; 4],
    pub current_turn: PieceColor,
    pub game_over: bool,
    pub black_score: usize,
    pub white_score: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_board_setup() {
        let game = GameBoard::new();
        let state = game.get_state();

        // Initial piece positions
        assert_eq!(state.board[1][1], Some(PieceColor::White));
        assert_eq!(state.board[1][2], Some(PieceColor::Black));
        assert_eq!(state.board[2][1], Some(PieceColor::Black));
        assert_eq!(state.board[2][2], Some(PieceColor::White));

        // Initial scores
        assert_eq!(state.black_score, 2);
        assert_eq!(state.white_score, 2);

        // Initial turn
        assert_eq!(state.current_turn, PieceColor::Black);

        // Game should not be over
        assert!(!state.game_over);
    }

    #[test]
    fn test_valid_moves() {
        let game = GameBoard::new();
        let valid_moves = game.get_valid_moves();

        // Initial valid moves for Black
        assert_eq!(valid_moves.len(), 4);
        assert!(valid_moves.contains(&Position { row: 0, col: 2 }));
        assert!(valid_moves.contains(&Position { row: 1, col: 3 }));
        assert!(valid_moves.contains(&Position { row: 2, col: 0 }));
        assert!(valid_moves.contains(&Position { row: 3, col: 1 }));
    }

    #[test]
    fn test_making_moves() {
        let mut game = GameBoard::new();

        // Make a valid move
        assert!(game.place_piece(Position { row: 1, col: 3 }));
        let state = game.get_state();

        // Check piece placement
        assert_eq!(state.board[1][3], Some(PieceColor::Black));

        // Check piece flipping
        assert_eq!(state.board[1][2], Some(PieceColor::Black));

        // Check turn change
        assert_eq!(state.current_turn, PieceColor::White);

        // Check score update
        assert_eq!(state.black_score, 3);
        assert_eq!(state.white_score, 1);
    }

    #[test]
    fn test_invalid_moves() {
        let mut game = GameBoard::new();

        // Try to place on occupied cell
        assert!(!game.place_piece(Position { row: 1, col: 1 }));

        // Try to place out of bounds
        assert!(!game.place_piece(Position { row: 4, col: 0 }));

        // Try to place where no pieces would be flipped
        assert!(!game.place_piece(Position { row: 0, col: 0 }));

        // Game state should remain unchanged
        let state = game.get_state();
        assert_eq!(state.current_turn, PieceColor::Black);
        assert_eq!(state.black_score, 2);
        assert_eq!(state.white_score, 2);
    }

    #[test]
    fn test_turn_skipping() {
        let mut game = GameBoard::new();

        // Set up a board state where next player has no moves
        game.board = [
            [
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
            ],
            [
                Some(PieceColor::Black),
                Some(PieceColor::White),
                Some(PieceColor::White),
                Some(PieceColor::Black),
            ],
            [
                Some(PieceColor::Black),
                Some(PieceColor::White),
                Some(PieceColor::White),
                Some(PieceColor::Black),
            ],
            [
                None,
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
            ],
        ];
        game.current_turn = PieceColor::White;

        // Make the only valid move for White
        assert!(game.place_piece(Position { row: 3, col: 0 }));
        let state = game.get_state();

        // Turn should be Black's now as White has no valid moves
        assert_eq!(state.current_turn, PieceColor::Black);
    }

    #[test]
    fn test_game_over() {
        let mut game = GameBoard::new();

        // Set up a board state where neither player has moves
        game.board = [
            [
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
            ],
            [
                Some(PieceColor::Black),
                Some(PieceColor::White),
                Some(PieceColor::White),
                Some(PieceColor::Black),
            ],
            [
                Some(PieceColor::Black),
                Some(PieceColor::White),
                Some(PieceColor::White),
                Some(PieceColor::Black),
            ],
            [
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
                Some(PieceColor::Black),
            ],
        ];
        game.update_score();

        // Check if game is correctly identified as over
        assert!(!game.has_valid_moves());
        game.process_turn();
        assert!(game.is_game_over());

        // Check winner determination
        assert_eq!(game.get_winner(), Some(PieceColor::Black));
    }
}
