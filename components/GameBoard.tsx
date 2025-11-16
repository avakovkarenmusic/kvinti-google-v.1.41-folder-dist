import React from 'react';
import { BOARD_SIZE, COLUMN_LABELS } from '../constants';
import type { Position, Piece, ColorOption } from '../types';

interface GameBoardProps {
  pieces: Piece[];
  selectedPiece: Piece | null;
  validMoves: Position[];
  validCaptures: Position[];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: number;
  crownIcon: React.FC;
  player1Color: ColorOption;
  player2Color: ColorOption;
  isAnimationEnabled: boolean;
  animationSpeed: number;
  isBoardFlipped: boolean;
}

const FiveDotsIcon: React.FC = () => {
    const dotRadius = 1.7;
    const dotSpacing = 4.5;
    return (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy={12 - 2 * dotSpacing} r={dotRadius}/>
          <circle cx="12" cy={12 - dotSpacing} r={dotRadius}/>
          <circle cx="12" cy="12" r={dotRadius}/>
          <circle cx="12" cy={12 + dotSpacing} r={dotRadius}/>
          <circle cx="12" cy={12 + 2 * dotSpacing} r={dotRadius}/>
        </svg>
    );
};

const LetterGIcon: React.FC = () => {
    const dotRadius = 1.7;
    const dotSpacing = 4.5;
    const cx_start = 9.75;
    const cy_start = 7.5;
    return (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx={cx_start} cy={cy_start} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + dotSpacing} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + 2 * dotSpacing} r={dotRadius}/>
            <circle cx={cx_start + dotSpacing} cy={cy_start} r={dotRadius}/>
        </svg>
    );
};

const ThreeDotsIcon: React.FC = () => {
    const dotRadius = 1.7;
    const dotSpacing = 4.5;
    return (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy={12 - dotSpacing} r={dotRadius}/>
          <circle cx="12" cy="12" r={dotRadius}/>
          <circle cx="12" cy={12 + dotSpacing} r={dotRadius}/>
        </svg>
    );
};

const ThreeVerticalTwoHorizontalIcon: React.FC = () => {
    const dotRadius = 1.7;
    const dotSpacing = 4.5;
    const cx_start = 7.5;
    const cy_start = 7.5;
    return (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx={cx_start} cy={cy_start} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + dotSpacing} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + 2 * dotSpacing} r={dotRadius}/>
            <circle cx={cx_start + dotSpacing} cy={cy_start} r={dotRadius}/>
            <circle cx={cx_start + 2 * dotSpacing} cy={cy_start} r={dotRadius}/>
        </svg>
    );
};

const FourVerticalOneHorizontalIcon: React.FC = () => {
    const dotRadius = 1.7;
    const dotSpacing = 4.5;
    const cx_start = 9.75;
    const cy_start = 5.25;
    return (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx={cx_start} cy={cy_start} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + dotSpacing} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + 2 * dotSpacing} r={dotRadius}/>
            <circle cx={cx_start} cy={cy_start + 3 * dotSpacing} r={dotRadius}/>
            <circle cx={cx_start + dotSpacing} cy={cy_start} r={dotRadius}/>
        </svg>
    );
};

const ICONS_MAP: Record<string, React.FC> = {
    '1': FiveDotsIcon,
    '2': LetterGIcon,
    '3': ThreeDotsIcon,
    '4': ThreeVerticalTwoHorizontalIcon,
    '5': FourVerticalOneHorizontalIcon
};

const GameBoard: React.FC<GameBoardProps> = ({ pieces, selectedPiece, validMoves, validCaptures, onCellClick, currentPlayer, crownIcon: CrownIcon, player1Color, player2Color, isAnimationEnabled, animationSpeed, isBoardFlipped }) => {
  const boardRotationClass = isBoardFlipped ? 'rotate-180' : '';
  const contentCounterRotationClass = isBoardFlipped ? 'rotate-180' : '';

  const displayedColumnLabels = isBoardFlipped ? [...COLUMN_LABELS].reverse() : COLUMN_LABELS;
  const displayedRowNumbers = isBoardFlipped 
    ? Array.from({ length: BOARD_SIZE }, (_, i) => i + 1) 
    : Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - i);

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / BOARD_SIZE;
    const cellHeight = rect.height / BOARD_SIZE;

    const visualCol = Math.floor(x / cellWidth);
    const visualRow = Math.floor(y / cellHeight);

    const logicalRow = isBoardFlipped ? BOARD_SIZE - 1 - visualRow : visualRow;
    const logicalCol = isBoardFlipped ? BOARD_SIZE - 1 - visualCol : visualCol;

    if (logicalRow >= 0 && logicalRow < BOARD_SIZE && logicalCol >= 0 && logicalCol < BOARD_SIZE) {
        onCellClick(logicalRow, logicalCol);
    }
  };

  const boardCells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
    const row = Math.floor(i / BOARD_SIZE);
    const col = i % BOARD_SIZE;

    const isAValidMove = validMoves.some(move => move.row === row && move.col === col);
    const isAValidCapture = validCaptures.some(cap => cap.row === row && cap.col === col);
    const isSelected = selectedPiece?.pos.row === row && selectedPiece?.pos.col === col;
    const pieceOnCell = pieces.find(p => p.pos.row === row && p.pos.col === col);

    const cellClasses = `
      w-full h-full aspect-square border border-gray-400 dark:border-gray-600
      flex items-center justify-center transition-colors duration-200
      ${isSelected
        ? 'bg-yellow-400/60 dark:bg-yellow-500/60'
        : isAValidCapture
        ? 'bg-red-400/50 hover:bg-red-400/70 dark:bg-red-500/40 dark:hover:bg-red-500/60'
        : isAValidMove
        ? 'bg-green-400/50 hover:bg-green-400/70 dark:bg-green-500/40 dark:hover:bg-green-500/60'
        : 'bg-white hover:bg-gray-200/50 dark:bg-gray-800 dark:hover:bg-gray-700'
      }
    `;
    
    return (
      <div key={`cell-${row}-${col}`} className={cellClasses}>
        {isAValidCapture && !pieceOnCell && (
           <div className="w-1/3 h-1/3 bg-red-500/50 rounded-full" />
        )}
      </div>
    );
  });

  const renderedPieces = pieces.map(piece => {
    const { row, col } = piece.pos;
    const isSelected = selectedPiece?.key === piece.key;
    const isPlayer1Piece = piece.player === 1;

    const pieceWrapperStyle = {
      transform: `translate(${col * 100}%, ${row * 100}%)`,
      width: `${100 / BOARD_SIZE}%`,
      height: `${100 / BOARD_SIZE}%`,
    };
    
    const dynamicAnimationStyle = isAnimationEnabled ? { transitionDuration: `${animationSpeed}ms` } : {};
    
    const pieceScaleClass = isSelected ? 'scale-110' : 'scale-100';
    const animationClass = isAnimationEnabled ? 'transition-transform ease-in-out' : '';
    const scaleAnimationClass = isAnimationEnabled ? 'transition-transform' : '';
    const allAnimationClass = isAnimationEnabled ? 'transition-all' : '';

    const pieceColor = isPlayer1Piece ? player1Color : player2Color;
    const opponentColor = isPlayer1Piece ? player2Color : player1Color;

    let iconColorClass = (pieceColor.name === 'Белый') ? 'text-black/90' : 'text-white/90';
    
    const pieceClasses = [
        'w-full h-full rounded-full',
        'flex items-center justify-center',
        allAnimationClass,
        `bg-gradient-to-br ${pieceColor.from} ${pieceColor.to}`,
        (opponentColor.name === 'Белый' || opponentColor.name === 'Черный') && 'border border-gray-500/70 dark:border-gray-400/70',
        isSelected && 'shadow-lg',
    ].filter(Boolean).join(' ');

    let IconComponent: React.FC | null = null;
    if (piece.id === 'FK') {
      IconComponent = CrownIcon;
    } else {
      const pieceType = piece.id.substring(1);
      IconComponent = ICONS_MAP[pieceType] || null;
    }

    return (
      <div
        key={piece.key}
        className={`absolute top-0 left-0 p-2 box-border pointer-events-none ${animationClass}`}
        style={{...pieceWrapperStyle, ...dynamicAnimationStyle}}
      >
        <div className={`w-full h-full ${scaleAnimationClass} ${pieceScaleClass} ${contentCounterRotationClass}`} style={dynamicAnimationStyle}>
          {IconComponent && (
            <div className={pieceClasses} style={dynamicAnimationStyle}>
              <div className={`w-full h-full ${iconColorClass}`}>
                <IconComponent />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  });
  
  return (
    <div 
      className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-0.5"
    >
      <div className="grid grid-cols-[0.8rem_1fr_0.8rem] grid-rows-[0.8rem_1fr_0.8rem] w-full h-full text-xs text-gray-900 dark:text-gray-400 font-mono gap-0.5">
        <div />
        <div className="grid grid-cols-7 col-start-2">
            {displayedColumnLabels.map(label => (
                <div key={`top-${label}`} className="relative flex items-center justify-center bottom-px">{label}</div>
            ))}
        </div>
        <div />
        <div className="grid grid-rows-7 row-start-2">
            {displayedRowNumbers.map(num => (
                <div key={`left-${num}`} className="flex items-center justify-center">{num}</div>
            ))}
        </div>
        
        <div 
          className={`relative bg-white dark:bg-gray-800 shadow-inner col-start-2 row-start-2 ${boardRotationClass} cursor-pointer`}
          onClick={handleBoardClick}
        >
            <div className="grid grid-cols-7 grid-rows-7 w-full h-full">
                {boardCells}
            </div>
            <div className="absolute inset-0 pointer-events-none">
                {renderedPieces}
            </div>
        </div>

        <div className="grid grid-rows-7 col-start-3 row-start-2">
            {displayedRowNumbers.map(num => (
                <div key={`right-${num}`} className="flex items-center justify-center">{num}</div>
            ))}
        </div>
        <div />
        <div className="grid grid-cols-7 col-start-2 row-start-3">
            {displayedColumnLabels.map(label => (
                <div key={`bottom-${label}`} className="relative flex items-center justify-center bottom-px">{label}</div>
            ))}
        </div>
        <div />
      </div>
    </div>
  );
};

export default GameBoard;