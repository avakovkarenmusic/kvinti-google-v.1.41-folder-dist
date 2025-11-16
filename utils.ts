
import { Position } from './types';
import { BOARD_SIZE, COLUMN_LABELS } from './constants';

export const positionToNotation = (pos: Position): string => {
  if (!pos) return '';
  const colLabel = COLUMN_LABELS[pos.col];
  const rowLabel = BOARD_SIZE - pos.row;
  return `${colLabel.toLowerCase()}${rowLabel}`;
};
