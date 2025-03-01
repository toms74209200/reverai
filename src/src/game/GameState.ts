import { GameState as TauriGameState, Position, newGame, makeMove, getValidMoves, mockTauriInterface } from './TauriInterface';

export type Player = 'Black' | 'White';
export type Cell = string | null; // 'Black' | 'White' | null

export class GameState {
  private board: Cell[][];
  private currentTurn: Player;
  private blackScore: number;
  private whiteScore: number;
  private gameOver: boolean;
  private validMoves: Position[];
  private useBackend: boolean;

  constructor(useBackend: boolean = true) {
    this.board = Array(4).fill(null).map(() => Array(4).fill(null));
    this.currentTurn = 'Black';
    this.blackScore = 2;
    this.whiteScore = 2;
    this.gameOver = false;
    this.validMoves = [];
    this.useBackend = useBackend;
    
    // 初期化すると同時にバックエンドと同期
    this.initializeGame();
  }

  private async initializeGame(): Promise<void> {
    try {
      if (this.useBackend) {
        const gameState = await newGame();
        this.updateStateFromBackend(gameState);
      } else {
        // デバッグモード: モック実装を使用
        const gameState = await mockTauriInterface.newGame();
        this.updateStateFromBackend(gameState);
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.initializeLocalBoard();
    }
  }

  // バックエンド通信に失敗した場合のフォールバック処理
  private initializeLocalBoard(): void {
    this.board = Array(4).fill(null).map(() => Array(4).fill(null));
    this.board[1][1] = 'White';
    this.board[1][2] = 'Black';
    this.board[2][1] = 'Black';
    this.board[2][2] = 'White';
    this.currentTurn = 'Black';
    this.blackScore = 2;
    this.whiteScore = 2;
    this.gameOver = false;
    this.validMoves = [
      { row: 0, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 0 },
      { row: 3, col: 1 }
    ];
  }

  private updateStateFromBackend(gameState: TauriGameState): void {
    // バックエンドからの状態を現在の状態に反映
    this.board = gameState.board.map(row => 
      row.map(cell => cell)
    );
    
    this.currentTurn = gameState.current_turn as Player;
    this.blackScore = gameState.black_score;
    this.whiteScore = gameState.white_score;
    this.gameOver = gameState.game_over;
    
    // 有効な手の更新
    this.updateValidMoves();
  }

  async updateValidMoves(): Promise<void> {
    try {
      if (this.useBackend) {
        this.validMoves = await getValidMoves();
      } else {
        this.validMoves = await mockTauriInterface.getValidMoves();
      }
    } catch (error) {
      console.error('Failed to get valid moves:', error);
      this.validMoves = [];
    }
  }

  async resetGame(): Promise<void> {
    try {
      if (this.useBackend) {
        const gameState = await newGame();
        this.updateStateFromBackend(gameState);
      } else {
        const gameState = await mockTauriInterface.newGame();
        this.updateStateFromBackend(gameState);
      }
    } catch (error) {
      console.error('Failed to reset game:', error);
      this.initializeLocalBoard();
    }
  }

  async makeMove(position: Position): Promise<boolean> {
    try {
      if (this.useBackend) {
        const gameState = await makeMove(position);
        this.updateStateFromBackend(gameState);
        return true;
      } else {
        const gameState = await mockTauriInterface.makeMove(position);
        this.updateStateFromBackend(gameState);
        return true;
      }
    } catch (error) {
      console.error('Failed to make move:', error);
      return false;
    }
  }

  getBoard(): Cell[][] {
    return this.board.map(row => [...row]);
  }

  getCurrentTurn(): Player {
    return this.currentTurn;
  }

  getScores(): { black: number; white: number } {
    return {
      black: this.blackScore,
      white: this.whiteScore
    };
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  getValidMoves(): Position[] {
    return [...this.validMoves];
  }
}