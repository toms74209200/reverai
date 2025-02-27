# Reversi Game Specification

## Overview
This document outlines the requirements for a Reversi game application using Rust/Tauri for the backend and TypeScript/Next.js for the frontend.

## Requirements

### Game Board
- The game board should be a 4x4 grid
- Each cell in the grid should be clickable
- The board should display the current state of the game

### Game Pieces
- Two types of game pieces: black and white
- Black pieces start the game
- Game pieces should be displayed visually distinguishable on the board

### Game Rules
- Players take turns placing pieces on the board
- A valid move must flank opponent's piece(s) between the newly placed piece and another piece of the player's color
- Flanked pieces are flipped to the current player's color
- If a player cannot make a valid move, their turn is skipped
- The game ends when neither player can make a valid move

### Game State
- The game should track whose turn it is (black or white)
- The game should track the score (number of black and white pieces)
- The game should detect when the game is over

### User Interface
- Display whose turn it is
- Display the current score
- Highlight valid moves for the current player
- Display a message when the game is over with the winner
- Allow starting a new game

### Technical Requirements
- Use Rust and Tauri for the backend game logic
- Use TypeScript and Next.js for the frontend
- Deploy using a Devcontainer configuration