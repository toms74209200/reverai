export type Player = 'Black' | 'White';
export type Cell = { Black: {} } | { White: {} } | null;
export type Board = Cell[][];
export type Position = { row: number; col: number };

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

export class GameState {
  private board: Board;
  private currentTurn: Player;
  private blackScore: number;
  private whiteScore: number;
  private gameOver: boolean;

  constructor() {
    this.board = Array(4).fill(null).map(() => Array(4).fill(null));
    this.initializeBoard();
    this.currentTurn = 'Black';
    this.updateScores();
    this.gameOver = false;
  }

  private initializeBoard(): void {
    // Set initial pieces
    this.board[1][1] = { White: {} };
    this.board[1][2] = { Black: {} };
    this.board[2][1] = { Black: {} };
    this.board[2][2] = { White: {} };
  }

  private updateScores(): void {
    let black = 0;
    let white = 0;
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cell = this.board[row][col];
        if (cell) {
          if ('Black' in cell) black++;
          if ('White' in cell) white++;
        }
      }
    }
    
    this.blackScore = black;
    this.whiteScore = white;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 4 && col >= 0 && col < 4;
  }

  private getCellOwner(cell: Cell): Player | null {
    if (!cell) return null;
    return 'Black' in cell ? 'Black' : 'White';
  }

  private getOpponent(player: Player): Player {
    return player === 'Black' ? 'White' : 'Black';
  }

  private wouldFlipInDirection(row: number, col: number, dir: readonly [number, number]): boolean {
    const [dx, dy] = dir;
    let x = row + dx;
    let y = col + dy;
    let foundOpponent = false;

    while (this.isValidPosition(x, y)) {
      const cell = this.board[x][y];
      const owner = this.getCellOwner(cell);

      if (!owner) return false;
      if (owner === this.currentTurn) return foundOpponent;
      if (owner === this.getOpponent(this.currentTurn)) foundOpponent = true;

      x += dx;
      y += dy;
    }

    return false;
  }

  private flipPiecesInDirection(row: number, col: number, dir: readonly [number, number]): void {
    const [dx, dy] = dir;
    let x = row + dx;
    let y = col + dy;

    const piecesToFlip: Position[] = [];

    while (this.isValidPosition(x, y)) {
      const cell = this.board[x][y];
      const owner = this.getCellOwner(cell);

      if (!owner) break;
      if (owner === this.currentTurn) {
        // Flip all pieces in the collected positions
        piecesToFlip.forEach(pos => {
          this.board[pos.row][pos.col] = { [this.currentTurn]: {} };
        });
        break;
      }
      if (owner === this.getOpponent(this.currentTurn)) {
        piecesToFlip.push({ row: x, col: y });
      }

      x += dx;
      y += dy;
    }
  }

  getBoard(): Board {
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
    const validMoves: Position[] = [];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col]) continue;
        
        // Check if placing a piece here would flip any opponent's pieces
        const wouldFlip = DIRECTIONS.some(dir => this.wouldFlipInDirection(row, col, dir));
        if (wouldFlip) {
          validMoves.push({ row, col });
        }
      }
    }
    
    return validMoves;
  }

  makeMove(position: Position): boolean {
    const { row, col } = position;
    
    // Check if position is valid
    if (!this.isValidPosition(row, col)) return false;
    
    // Check if cell is empty
    if (this.board[row][col]) return false;
    
    // Check if this move would flip any pieces
    const validDirections = DIRECTIONS.filter(dir => this.wouldFlipInDirection(row, col, dir));
    if (validDirections.length === 0) return false;
    
    // Place the piece
    this.board[row][col] = { [this.currentTurn]: {} };
    
    // Flip pieces in all valid directions
    validDirections.forEach(dir => this.flipPiecesInDirection(row, col, dir));
    
    // Update scores
    this.updateScores();
    
    // Change turn
    this.currentTurn = this.getOpponent(this.currentTurn);
    
    // Check if game is over (no valid moves for next player)
    const nextPlayerHasValidMoves = this.getValidMoves().length > 0;
    if (!nextPlayerHasValidMoves) {
      // Check if current player would have valid moves
      const tempTurn = this.currentTurn;
      this.currentTurn = this.getOpponent(this.currentTurn);
      const currentPlayerHasValidMoves = this.getValidMoves().length > 0;
      this.currentTurn = tempTurn;

      // If neither player has valid moves, game is over
      if (!currentPlayerHasValidMoves) {
        this.gameOver = true;
      } else {
        // Skip turn if next player has no valid moves
        this.currentTurn = this.getOpponent(this.currentTurn);
      }
    }
    
    return true;
  }
}