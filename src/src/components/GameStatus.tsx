"use client";

import React from 'react';
import styles from './GameStatus.module.css';

interface GameStatusProps {
  currentTurn: 'Black' | 'White';
  blackScore: number;
  whiteScore: number;
  gameOver: boolean;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  currentTurn,
  blackScore,
  whiteScore,
  gameOver
}) => {
  const winner = gameOver ? 
    blackScore > whiteScore ? 'Black' :
    whiteScore > blackScore ? 'White' :
    'Tie' : null;

  return (
    <div className={styles.statusContainer} data-testid="game-status">
      <div className={styles.scoreContainer}>
        <div className={styles.scoreBox}>
          <div className={styles.blackPiece} aria-label="Black piece" />
          <span data-testid="black-score" aria-label="Black score">{blackScore}</span>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.whitePiece} aria-label="White piece" />
          <span data-testid="white-score" aria-label="White score">{whiteScore}</span>
        </div>
      </div>
      
      {!gameOver ? (
        <div className={styles.turnIndicator} data-testid="turn-indicator">
          Current Turn:
          <span 
            className={currentTurn === 'Black' ? styles.blackText : styles.whiteText}
            aria-label="Current player"
          >
            {` ${currentTurn}`}
          </span>
        </div>
      ) : (
        <div className={styles.gameOverMessage} data-testid="game-over-message">
          Game Over! 
          <span aria-label="Game result">
            {winner === 'Tie' ? " It's a tie!" : ` ${winner} wins!`}
          </span>
        </div>
      )}
    </div>
  );
};