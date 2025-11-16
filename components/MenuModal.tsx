import React from 'react';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onStartAIConfig: () => void;
  glowColor: string;
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onNewGame, onStartAIConfig, glowColor }) => {
  if (!isOpen) {
    return null;
  }

  const baseButtonClasses = "w-full text-left p-3 rounded-lg font-semibold transition-colors duration-200";
  const activeButtonClasses = `${baseButtonClasses} bg-gray-100 hover:bg-indigo-500 hover:text-white text-gray-800 dark:bg-gray-700 dark:hover:bg-indigo-600 dark:text-white`;
  const disabledButtonClasses = `${baseButtonClasses} bg-gray-200/50 text-gray-500/50 cursor-not-allowed dark:bg-gray-600/50 dark:text-gray-400/50`;
  
  const handleStartAI = () => {
    onStartAIConfig();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative m-4 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 rounded-lg container-glow"
          style={{ '--glow-color': glowColor }}
        />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 flex flex-col gap-4">
          <div className="flex justify-between items-center text-gray-800 dark:text-white">
            <h2 className="text-2xl font-bold">Меню</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Закрыть">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={onNewGame}
              className={activeButtonClasses}
            >
              Одиночная игра
            </button>
            <button 
              onClick={handleStartAI}
              className={activeButtonClasses}
            >
              Против ИИ
            </button>
            <button 
              disabled 
              className={disabledButtonClasses}
              title="Скоро"
            >
              Сетевая игра
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;