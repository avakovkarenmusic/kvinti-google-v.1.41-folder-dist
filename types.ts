
export interface Position {
  row: number;
  col: number;
}

export type PieceId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'FK';

export interface Piece {
  key: string; // Unique identifier, e.g., 'W1', 'B5'
  id: PieceId;  // Type identifier, e.g., 'F1', 'FK'
  pos: Position;
  player: 1 | 2;
}

export interface ColorOption {
  name: string;
  from: string;
  to: string;
  extra?: string;
  textColor: string;
  shadowColor: string;
}