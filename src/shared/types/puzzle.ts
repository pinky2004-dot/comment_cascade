// src/shared/types/puzzle.ts

export type PuzzleData = {
  comments: string[];
  correctUrl: string;
  originalComments: string[]; // Store original comments for reveal system
  revealedWords: string[][]; // Track which words are revealed for each comment
};

export type GameState = {
  puzzle: PuzzleData;
  attempts: number;
  maxAttempts: number;
  gameWon: boolean;
};