"use client";

import React, { useCallback } from 'react';
import styles from './NewGameButton.module.css';

interface NewGameButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const NewGameButton: React.FC<NewGameButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick();
  }, [disabled, onClick]);

  return (
    <button
      className={`${styles.newGameButton} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
      disabled={disabled}
      data-testid="new-game-button"
      aria-label="Start new game"
      tabIndex={disabled ? -1 : 0}
    >
      Start New Game
    </button>
  );
};