import React, { useEffect, useRef } from 'react';
import type { Piece, ColorOption } from '../types';

interface HistoryEntry {
  pieces: Piece[];
  currentPlayer: number;
  move: string | null;
}

interface MoveHistoryProps {
  history: HistoryEntry[];
  currentMoveIndex: number;
  onHistoryClick: (index: number) => void;
  onNavigateHistory: (direction: 'prev' | 'next') => void;
  player1Color: ColorOption;
  player2Color: ColorOption;
}

const CaptureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline-block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);


const MoveHistory: React.FC<MoveHistoryProps> = ({ history, currentMoveIndex, onHistoryClick, onNavigateHistory, player1Color, player2Color }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to bottom to see the latest move
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  const turns: { moveNumber: number, p1: HistoryEntry | null, p2: HistoryEntry | null, p1Index: number, p2Index: number | null }[] = [];
  for (let i = 1; i < history.length; i += 2) {
    const p1Move = history[i];
    const p2Move = history.length > i + 1 ? history[i + 1] : null;
    turns.push({
      moveNumber: Math.ceil(i / 2),
      p1: p1Move,
      p2: p2Move,
      p1Index: i,
      p2Index: p2Move ? i + 1 : null,
    });
  }

  const isPrevDisabled = currentMoveIndex <= 0;
  const isNextDisabled = currentMoveIndex >= history.length - 1;

  const MoveButton = ({ move, index }: { move: HistoryEntry | null, index: number | null }) => {
    if (!move || index === null) {
      return <div className="flex-1 p-0.5 min-w-0 h-full" />;
    }
    const isActive = index === currentMoveIndex;
    
    const buttonClasses = `
      text-left w-full h-full px-2 rounded transition-colors duration-200 text-sm font-mono flex items-center justify-start gap-2
      ${isActive
        ? 'bg-indigo-200 text-indigo-900 font-semibold dark:bg-indigo-500 dark:text-white'
        : 'bg-gray-100 hover:bg-gray-200/70 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}
    `;
    
    const isCapture = move.move?.includes('x');
    let baseMove = move.move || '';
    let capturedPieceId = '';

    if (isCapture && move.move) {
        const parts = move.move.split('x');
        baseMove = parts[0];
        capturedPieceId = parts[1];
    }

    return (
      <div className="flex-1 p-0.5 min-w-0 h-full">
        <button onClick={() => onHistoryClick(index)} className={buttonClasses}>
          <span className="truncate">{baseMove}</span>
          {isCapture && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <CaptureIcon />
              <span>{capturedPieceId}</span>
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 pt-1 px-2 pb-2 flex flex-col"
    >
       <div className="flex justify-between items-center mb-0.5 text-gray-700 dark:text-gray-400">
        <button 
          onClick={() => onNavigateHistory('prev')} 
          disabled={isPrevDisabled}
          className="p-1 rounded-full hover:bg-gray-300/70 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Предыдущий ход"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-base font-semibold text-center text-gray-800 dark:text-gray-200">История ходов</h2>
        <button 
          onClick={() => onNavigateHistory('next')}
          disabled={isNextDisabled}
          className="p-1 rounded-full hover:bg-gray-300/70 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Следующий ход"
        >
          <ArrowRightIcon />
        </button>
      </div>

      <div className="flex items-center pb-0.5 border-b border-gray-300 dark:border-gray-600 text-base font-bold">
        <div className="w-8 flex-shrink-0 pr-2" /> {/* Spacer to align with move numbers */}
        <div className={`flex-1 text-center transition-colors ${player1Color.textColor}`}>Игрок 1</div>
        <div className={`flex-1 text-center transition-colors ${player2Color.textColor}`}>Игрок 2</div>
      </div>
      <div ref={scrollContainerRef} className="overflow-y-auto flex-1 pr-2 -mr-2 flex flex-col">
        {history.length === 1 ? (
            <div className="flex-grow flex items-center justify-center text-center text-gray-500 dark:text-gray-400 text-sm">Ходов еще нет.</div>
        ) : (
           turns.map(turn => (
            <div key={turn.moveNumber} className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700/50 h-7 flex-shrink-0">
              <div className="font-mono text-gray-600 dark:text-gray-400 text-sm w-8 text-right flex-shrink-0 pr-2">{turn.moveNumber}.</div>
              <MoveButton move={turn.p1} index={turn.p1Index} />
              <MoveButton move={turn.p2} index={turn.p2Index} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoveHistory;