use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum PieceColor {
    Black,
    White,
}

impl PieceColor {
    pub fn opposite(&self) -> PieceColor {
        match self {
            PieceColor::Black => PieceColor::White,
            PieceColor::White => PieceColor::Black,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub struct Position {
    pub row: usize,
    pub col: usize,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameBoard {
    board: [[Option<PieceColor>; 4]; 4],
    current_turn: PieceColor,
    game_over: bool,
    black_score: usize,
    white_score: usize,
}

const DIRECTIONS: [(isize, isize); 8] = [
    (-1, -1),
    (-1, 0),
    (-1, 1),
    (0, -1),
    (0, 1),
    (1, -1),
    (1, 0),
    (1, 1),
];

impl GameBoard {
    pub fn new() -> Self {
        let mut board = [[None; 4]; 4];
        board[1][1] = Some(PieceColor::White);
        board[1][2] = Some(PieceColor::Black);
        board[2][1] = Some(PieceColor::Black);
        board[2][2] = Some(PieceColor::White);

        let mut game = GameBoard {
            board,
            current_turn: PieceColor::Black,
            game_over: false,
            black_score: 2,
            white_score: 2,
        };
        game.update_score();
        game
    }

    fn is_valid_position(&self, row: isize, col: isize) -> bool {
        row >= 0 && row < 4 && col >= 0 && col < 4
    }

    pub fn is_valid_move(&self, position: Position) -> bool {
        let row = position.row;
        let col = position.col;

        // 盤面外や既に駒がある場所には置けない
        if row >= 4 || col >= 4 || self.board[row][col].is_some() {
            return false;
        }

        let current_color = self.current_turn;

        // いずれかの方向で相手の駒を挟めるかチェック
        for (dr, dc) in DIRECTIONS {
            let mut r = row as isize + dr;
            let mut c = col as isize + dc;
            let mut found_opponent = false;

            while self.is_valid_position(r, c) {
                match self.board[r as usize][c as usize] {
                    Some(color) if color == current_color.opposite() => {
                        found_opponent = true;
                        r += dr;
                        c += dc;
                    }
                    Some(color) if color == current_color && found_opponent => {
                        return true;
                    }
                    _ => break,
                }
            }
        }
        false
    }

    pub fn get_valid_moves(&self) -> Vec<Position> {
        let mut valid_moves = Vec::new();
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

    pub fn place_piece(&mut self, position: Position) -> bool {
        if !self.is_valid_move(position) {
            return false;
        }

        let row = position.row;
        let col = position.col;
        let current_color = self.current_turn;

        self.board[row][col] = Some(current_color);

        // 8方向それぞれについて、挟める駒を反転
        for (dr, dc) in DIRECTIONS {
            let mut r = row as isize + dr;
            let mut c = col as isize + dc;
            let mut to_flip = Vec::new();

            // その方向に沿って駒を探索
            while self.is_valid_position(r, c) {
                match self.board[r as usize][c as usize] {
                    Some(color) if color == current_color.opposite() => {
                        to_flip.push((r as usize, c as usize));
                        r += dr;
                        c += dc;
                    }
                    Some(color) if color == current_color => {
                        // 自分の色の駒が見つかったら、その間の駒を反転
                        for (fr, fc) in to_flip {
                            self.board[fr][fc] = Some(current_color);
                        }
                        break;
                    }
                    _ => break,
                }
            }
        }

        self.update_score();
        self.process_turn();
        true
    }

    pub fn switch_turn(&mut self) {
        self.current_turn = self.current_turn.opposite();
    }

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

    pub fn set_game_over(&mut self) {
        self.game_over = true;
    }

    pub fn get_winner(&self) -> Option<PieceColor> {
        if self.black_score > self.white_score {
            Some(PieceColor::Black)
        } else if self.white_score > self.black_score {
            Some(PieceColor::White)
        } else {
            None
        }
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn get_state(&self) -> GameState {
        GameState {
            board: self.board,
            current_turn: self.current_turn,
            game_over: self.game_over,
            black_score: self.black_score,
            white_score: self.white_score,
        }
    }

    fn process_turn(&mut self) {
        self.switch_turn();

        if !self.has_valid_moves() {
            self.switch_turn();
            if !self.has_valid_moves() {
                self.set_game_over();
            } else {
                self.switch_turn();
            }
        }
    }
}

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

        assert_eq!(state.board[1][1], Some(PieceColor::White));
        assert_eq!(state.board[1][2], Some(PieceColor::Black));
        assert_eq!(state.board[2][1], Some(PieceColor::Black));
        assert_eq!(state.board[2][2], Some(PieceColor::White));

        assert_eq!(state.black_score, 2);
        assert_eq!(state.white_score, 2);

        assert_eq!(state.current_turn, PieceColor::Black);
        assert!(!state.game_over);
    }

    #[test]
    fn test_valid_moves() {
        let game = GameBoard::new();
        let valid_moves = game.get_valid_moves();

        assert_eq!(valid_moves.len(), 4);
        assert!(valid_moves.contains(&Position { row: 0, col: 2 }));
        assert!(valid_moves.contains(&Position { row: 1, col: 3 }));
        assert!(valid_moves.contains(&Position { row: 2, col: 0 }));
        assert!(valid_moves.contains(&Position { row: 3, col: 1 }));
    }

    #[test]
    fn test_making_moves() {
        let mut game = GameBoard::new();

        assert!(game.place_piece(Position { row: 1, col: 3 }));
        let state = game.get_state();

        assert_eq!(state.board[1][3], Some(PieceColor::Black));
        assert_eq!(state.board[1][2], Some(PieceColor::Black));
        assert_eq!(state.current_turn, PieceColor::White);
        assert_eq!(state.black_score, 3);
        assert_eq!(state.white_score, 1);
    }

    #[test]
    fn test_invalid_moves() {
        let mut game = GameBoard::new();

        assert!(!game.place_piece(Position { row: 1, col: 1 }));
        assert!(!game.place_piece(Position { row: 4, col: 0 }));
        assert!(!game.place_piece(Position { row: 0, col: 0 }));

        let state = game.get_state();
        assert_eq!(state.current_turn, PieceColor::Black);
        assert_eq!(state.black_score, 2);
        assert_eq!(state.white_score, 2);
    }

    #[test]
    fn test_game_over() {
        let mut game = GameBoard::new();

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

        assert!(!game.has_valid_moves());
        game.process_turn();
        assert!(game.is_game_over());
        assert_eq!(game.get_winner(), Some(PieceColor::Black));
    }
}
