"use client";

import React, { useCallback } from 'react';
import styles from './GameBoard.module.css';

type PieceType = {
  Black?: {};
  White?: {};
} | null;

interface GameBoardProps {
  board: PieceType[][];
  validMoves: { row: number; col: number }[];
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  validMoves, 
  onCellClick,
  disabled = false 
}) => {
  const handleCellClick = useCallback((row: number, col: number) => {
    if (disabled) return;
    onCellClick(row, col);
  }, [disabled, onCellClick]);

  const isValidMove = useCallback((row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  }, [validMoves]);

  const getPieceColor = (piece: PieceType): string | null => {
    if (!piece) return null;
    return 'Black' in piece ? 'black' : 'white';
  };

  return (
    <div 
      className={styles.board} 
      data-testid="game-board"
      aria-disabled={disabled}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, colIndex) => {
            const isValid = isValidMove(rowIndex, colIndex);
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${isValid ? styles.validMove : ''} ${disabled ? styles.disabled : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                data-testid={`cell-${rowIndex}-${colIndex}`}
                role="button"
                aria-label={`Cell ${rowIndex}-${colIndex}`}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
              >
                {cell && (
                  <div 
                    className={`${styles.piece} ${styles[getPieceColor(cell) || '']}`}
                    data-testid={`piece-${rowIndex}-${colIndex}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};