import React from 'react';
import { ColorOption } from '../types';

interface GameInfoProps {
  currentPlayer: number;
  onMenuClick: () => void;
  onDesignClick: () => void;
  isPanelOpen: boolean;
  player1Color: ColorOption;
  player2Color: ColorOption;
}

const BrushIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const CrossIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayer, onMenuClick, onDesignClick, isPanelOpen, player1Color, player2Color }) => {
  const playerColorClass = currentPlayer === 1 ? player1Color.textColor : player2Color.textColor;
  
  const buttonBaseClasses = "h-10 w-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all z-50";
  
  const brushButtonClasses = "rounded-full bg-gray-100 text-gray-700 font-semibold shadow-md hover:bg-gray-200 border border-gray-300 dark:border-transparent dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";
  
  const crossButtonClasses = "text-gray-800 dark:text-white";

  return (
    <div 
      className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-2"
    >
      <div className="grid grid-cols-3 items-center text-gray-800 dark:text-white">
        <button 
          onClick={onMenuClick}
          className="justify-self-start px-4 h-10 flex items-center bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          Меню
        </button>
        <p className="justify-self-center text-center text-xl font-semibold whitespace-nowrap">
          Ход: <span className={`transition-colors duration-300 ${playerColorClass}`}>Игрок {currentPlayer}</span>
        </p>
        <div className="flex items-center justify-self-end">
            <button 
                onClick={onDesignClick}
                className={`${buttonBaseClasses} ${isPanelOpen ? crossButtonClasses : brushButtonClasses}`}
                aria-label="Настроить дизайн"
            >
                {isPanelOpen ? <CrossIcon /> : <BrushIcon />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;