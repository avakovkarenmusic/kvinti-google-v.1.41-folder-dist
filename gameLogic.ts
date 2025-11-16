import type { Piece, Position } from './types';
import { BOARD_SIZE } from './constants';

export const getCaptureMoves = (piece: Piece, allPieces: Piece[]): Position[] => {
    const captures: Position[] = [];
    const opponentPieces = allPieces.filter(p => p.player !== piece.player);

    const jumpPatterns: { [key: string]: {dr: number, dc: number, jump: number}[] } = {
        '1': [
            { dr: -4, dc: 0, jump: 0 }, { dr: 4, dc: 0, jump: 0 }, { dr: 0, dc: -4, jump: 0 }, { dr: 0, dc: 4, jump: 0 }
        ],
        '2': [
            { dr: -2, dc: -1, jump: 0 }, { dr: -2, dc: 1, jump: 0 }, { dr: 2, dc: -1, jump: 0 }, { dr: 2, dc: 1, jump: 0 },
            { dr: -1, dc: -2, jump: 0 }, { dr: -1, dc: 2, jump: 0 }, { dr: 1, dc: -2, jump: 0 }, { dr: 1, dc: 2, jump: 0 }
        ],
        '3': [
            { dr: -2, dc: 0, jump: 1 }, { dr: 2, dc: 0, jump: 1 }, { dr: 0, dc: -2, jump: 1 }, { dr: 0, dc: 2, jump: 1 }
        ],
        '4': [
            { dr: -2, dc: -2, jump: 1 }, { dr: -2, dc: 2, jump: 1 }, { dr: 2, dc: -2, jump: 1 }, { dr: 2, dc: 2, jump: 1 }
        ],
        '5': [
            { dr: -3, dc: -1, jump: 0 }, { dr: -3, dc: 1, jump: 0 }, { dr: 3, dc: -1, jump: 0 }, { dr: 3, dc: 1, jump: 0 },
            { dr: -1, dc: -3, jump: 0 }, { dr: -1, dc: 3, jump: 0 }, { dr: 1, dc: -3, jump: 0 }, { dr: 1, dc: 3, jump: 0 }
        ]
    };

    const pieceType = piece.id.substring(1);
    if (piece.id === 'FK') return []; // Kings don't capture this way
    const patterns = jumpPatterns[pieceType] || [];

    for (const pattern of patterns) {
        const targetRow = piece.pos.row + pattern.dr;
        const targetCol = piece.pos.col + pattern.dc;
        
        const isWithinBounds = targetRow >= 0 && targetRow < BOARD_SIZE && targetCol >= 0 && targetCol < BOARD_SIZE;
        if (!isWithinBounds) continue;

        const targetOpponent = opponentPieces.find(p => p.pos.row === targetRow && p.pos.col === targetCol);
        if (!targetOpponent) continue;

        captures.push({ row: targetRow, col: targetCol });
    }
    return captures;
  };

  export const getStandardMoves = (piece: Piece, allPieces: Piece[]): Position[] => {
    const isKvinti = piece.id === 'FK';
    const directions = isKvinti 
      ? [{ r: 0, c: -1 }, { r: 0, c: 1 }] // Horizontal
      : [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }]; // All 4

    const moves: Position[] = [];
    for (const dir of directions) {
        const newRow = piece.pos.row + dir.r;
        const newCol = piece.pos.col + dir.c;
        const isWithinBounds = newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE;
        const isOccupied = allPieces.some(p => p.pos.row === newRow && p.pos.col === newCol);
        if (isWithinBounds && !isOccupied) {
            moves.push({ row: newRow, col: newCol });
        }
    }
    return moves;
  }

  export const getAllValidActionsForPiece = (piece: Piece, allPieces: Piece[]): { moves: Position[], captures: Position[] } => {
    return {
        moves: getStandardMoves(piece, allPieces),
        captures: getCaptureMoves(piece, allPieces)
    }
  }
