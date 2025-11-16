import type { Piece, Position } from './types';
import type { AIDifficulty } from './components/AIConfigModal';
import { getAllValidActionsForPiece } from './gameLogic';

type Move = { piece: Piece; target: Position };

export function generateAllPossibleMoves(pieces: Piece[], player: number): Move[] {
  const playerPieces = pieces.filter(p => p.player === player);
  const allMoves: Move[] = [];

  for (const piece of playerPieces) {
    const { moves, captures } = getAllValidActionsForPiece(piece, pieces);
    moves.forEach(target => allMoves.push({ piece, target }));
    captures.forEach(target => allMoves.push({ piece, target }));
  }

  return allMoves;
}

function evaluateBoard(pieces: Piece[], aiPlayer: number): number {
    const opponentPlayer = aiPlayer === 1 ? 2 : 1;
    
    const aiKing = pieces.find(p => p.player === aiPlayer && p.id === 'FK');
    if (!aiKing) return -Infinity; // AI loses if its king is captured

    const opponentKing = pieces.find(p => p.player === opponentPlayer && p.id === 'FK');
    if (!opponentKing) return Infinity; // AI wins if it captures the opponent's king
    
    let score = 0;
    for (const piece of pieces) {
        const pieceValue = piece.id === 'FK' ? 5 : 1; // King is more valuable
        const isAiPiece = piece.player === aiPlayer;
        score += isAiPiece ? pieceValue : -pieceValue;
    }

    return score;
}

function minimax(
  currentPieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  aiPlayer: number
): number {
  const currentPlayer = isMaximizingPlayer ? aiPlayer : (aiPlayer === 1 ? 2 : 1);
  
  // Check for terminal states (game over)
  const aiKing = currentPieces.find(p => p.player === aiPlayer && p.id === 'FK');
  const opponentKing = currentPieces.find(p => p.player !== aiPlayer && p.id === 'FK');

  if (depth === 0 || !aiKing || !opponentKing) {
    return evaluateBoard(currentPieces, aiPlayer);
  }

  const allMoves = generateAllPossibleMoves(currentPieces, currentPlayer);
  if (allMoves.length === 0) { // Stalemate or no moves for current player
      return evaluateBoard(currentPieces, aiPlayer);
  }

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of allMoves) {
      const newPieces = currentPieces
        .map(p => p.key === move.piece.key ? { ...p, pos: move.target } : p)
        .filter(p => !(p.pos.row === move.target.row && p.pos.col === move.target.col && p.key !== move.piece.key));
      
      const evaluation = minimax(newPieces, depth - 1, alpha, beta, false, aiPlayer);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else { // Minimizing player
    let minEval = Infinity;
    for (const move of allMoves) {
       const newPieces = currentPieces
        .map(p => p.key === move.piece.key ? { ...p, pos: move.target } : p)
        .filter(p => !(p.pos.row === move.target.row && p.pos.col === move.target.col && p.key !== move.piece.key));
        
      const evaluation = minimax(newPieces, depth - 1, alpha, beta, true, aiPlayer);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

export function calculateAIMove(
  pieces: Piece[],
  aiPlayer: number,
  difficulty: AIDifficulty
): Move | null {
  const allMoves = generateAllPossibleMoves(pieces, aiPlayer);
  if (allMoves.length === 0) {
    console.warn("AI has no possible moves.");
    return null;
  }

  if (difficulty === 'easy') {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  let bestMove: Move | null = null;
  let bestValue = -Infinity;

  const depth = difficulty === 'medium' ? 2 : 4;

  for (const move of allMoves) {
    const newPieces = pieces
      .map(p => p.key === move.piece.key ? { ...p, pos: move.target } : p)
      .filter(p => !(p.pos.row === move.target.row && p.pos.col === move.target.col && p.key !== move.piece.key));
    
    const moveValue = minimax(newPieces, depth - 1, -Infinity, Infinity, false, aiPlayer);

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove || allMoves[0]; // Fallback to a valid move if something goes wrong
}