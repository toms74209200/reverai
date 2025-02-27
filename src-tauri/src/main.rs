// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod game;
use game::{GameBoard, GameState, PieceColor, Position};
use std::sync::Mutex;
use tauri::State;

struct GameContainer {
    board: Mutex<GameBoard>,
}

#[tauri::command]
fn get_board_state(game_state: State<GameContainer>) -> GameState {
    game_state.board.lock().unwrap().get_state()
}

#[tauri::command]
fn make_move(position: Position, game_state: State<GameContainer>) -> Result<GameState, String> {
    let mut board = game_state.board.lock().unwrap();
    if board.place_piece(position) {
        Ok(board.get_state())
    } else {
        Err("Invalid move".into())
    }
}

#[tauri::command]
fn new_game(game_state: State<GameContainer>) -> GameState {
    let mut board = game_state.board.lock().unwrap();
    *board = GameBoard::new();
    board.get_state()
}

#[tauri::command]
fn get_valid_moves(game_state: State<GameContainer>) -> Vec<Position> {
    game_state.board.lock().unwrap().get_valid_moves()
}

fn main() {
    tauri::Builder::default()
        .manage(GameContainer {
            board: Mutex::new(GameBoard::new()),
        })
        .invoke_handler(tauri::generate_handler![
            get_board_state,
            make_move,
            new_game,
            get_valid_moves
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
