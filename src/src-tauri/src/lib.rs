use std::sync::Mutex;
use tauri::{generate_handler, Manager, Runtime, State};

pub mod game;

// アプリケーションの状態管理
pub struct AppState {
    game: Mutex<game::GameBoard>,
}

// ゲーム状態をシリアライズするための構造体
#[derive(serde::Serialize)]
pub struct SerializedGameState {
    pub board: Vec<Vec<Option<String>>>,
    pub current_turn: String,
    pub game_over: bool,
    pub black_score: usize,
    pub white_score: usize,
}

// 新しいゲームを開始するコマンド
#[tauri::command]
pub fn new_game(state: State<AppState>) -> Result<SerializedGameState, String> {
    let mut game_board = state
        .game
        .lock()
        .map_err(|_| "Failed to lock game state".to_string())?;
    *game_board = game::GameBoard::new();
    let game_state = game_board.get_state();

    Ok(serialize_game_state(&game_state))
}

// 指定した位置に駒を配置するコマンド
#[tauri::command]
pub fn make_move(
    position: game::Position,
    state: State<AppState>,
) -> Result<SerializedGameState, String> {
    let mut game_board = state
        .game
        .lock()
        .map_err(|_| "Failed to lock game state".to_string())?;

    if !game_board.place_piece(position) {
        return Err("Invalid move".to_string());
    }

    let game_state = game_board.get_state();
    Ok(serialize_game_state(&game_state))
}

// 現在の有効な手の一覧を取得するコマンド
#[tauri::command]
pub fn get_valid_moves(state: State<AppState>) -> Result<Vec<game::Position>, String> {
    let game_board = state
        .game
        .lock()
        .map_err(|_| "Failed to lock game state".to_string())?;
    Ok(game_board.get_valid_moves())
}

// ゲーム状態をフロントエンド用にシリアライズする関数
fn serialize_game_state(state: &game::GameState) -> SerializedGameState {
    let mut board = Vec::with_capacity(4);

    for row in &state.board {
        let mut serialized_row = Vec::with_capacity(4);
        for &cell in row {
            match cell {
                Some(game::PieceColor::Black) => serialized_row.push(Some("Black".to_string())),
                Some(game::PieceColor::White) => serialized_row.push(Some("White".to_string())),
                None => serialized_row.push(None),
            }
        }
        board.push(serialized_row);
    }

    let current_turn = match state.current_turn {
        game::PieceColor::Black => "Black".to_string(),
        game::PieceColor::White => "White".to_string(),
    };

    SerializedGameState {
        board,
        current_turn,
        game_over: state.game_over,
        black_score: state.black_score,
        white_score: state.white_score,
    }
}

// Tauriアプリケーションのエントリーポイント
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // アプリケーション状態の初期化
    let game_state = Mutex::new(game::GameBoard::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .manage(AppState { game: game_state })
        // コマンドハンドラの登録
        .invoke_handler(generate_handler![new_game, make_move, get_valid_moves])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
