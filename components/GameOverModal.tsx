import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  message: string;
  onNewGame: () => void;
  glowColor: string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, message, onNewGame, glowColor }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative m-4 w-full max-w-sm">
        <div 
          className="absolute inset-0 rounded-lg container-glow"
          style={{ '--glow-color': glowColor }}
        />
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 flex flex-col gap-4 items-center text-center"
        >
          <div className="text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold mb-2">Игра окончена</h2>
            <p className="text-lg">{message}</p>
          </div>
          <button 
            onClick={onNewGame}
            className="w-full max-w-xs mt-4 p-3 rounded-lg font-semibold transition-colors duration-200 bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Новая игра
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;