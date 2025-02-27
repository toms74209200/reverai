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
            [Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black)],
            [Some(PieceColor::Black), Some(PieceColor::White), Some(PieceColor::White), Some(PieceColor::Black)],
            [Some(PieceColor::Black), Some(PieceColor::White), Some(PieceColor::White), Some(PieceColor::Black)],
            [None, Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black)],
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
            [Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black)],
            [Some(PieceColor::Black), Some(PieceColor::White), Some(PieceColor::White), Some(PieceColor::Black)],
            [Some(PieceColor::Black), Some(PieceColor::White), Some(PieceColor::White), Some(PieceColor::Black)],
            [Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black), Some(PieceColor::Black)],
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