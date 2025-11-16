import React, { useState } from 'react';

export type AIDifficulty = 'easy' | 'medium' | 'hard';
export interface AIConfig {
    difficulty: AIDifficulty;
    playerSide: 1 | 2;
}

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: AIConfig) => void;
  glowColor: string;
}

const RadioPill: React.FC<{ label: string; name: string; value: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, checked, onChange }) => {
    const checkedClasses = 'bg-indigo-600 text-white';
    const uncheckedClasses = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';
    return (
        <label className={`flex-1 text-center px-4 py-2 rounded-full cursor-pointer transition-colors duration-200 ${checked ? checkedClasses : uncheckedClasses}`}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
            {label}
        </label>
    );
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, onStartGame, glowColor }) => {
    const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
    const [playerSide, setPlayerSide] = useState<1 | 2>(1);

    if (!isOpen) {
        return null;
    }

    const handleStart = () => {
        onStartGame({ difficulty, playerSide });
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
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 flex flex-col gap-6">
                    <div className="flex justify-between items-center text-gray-800 dark:text-white">
                        <h2 className="text-2xl font-bold">Настроить ИИ</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Закрыть">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Сложность</h3>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-full">
                               <RadioPill label="Легко" name="difficulty" value="easy" checked={difficulty === 'easy'} onChange={(e) => setDifficulty(e.target.value as AIDifficulty)} />
                               <RadioPill label="Средне" name="difficulty" value="medium" checked={difficulty === 'medium'} onChange={(e) => setDifficulty(e.target.value as AIDifficulty)} />
                               <RadioPill label="Сложно" name="difficulty" value="hard" checked={difficulty === 'hard'} onChange={(e) => setDifficulty(e.target.value as AIDifficulty)} />
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Играть за</h3>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-full">
                               <RadioPill label="Игрока 1" name="playerSide" value="1" checked={playerSide === 1} onChange={() => setPlayerSide(1)} />
                               <RadioPill label="Игрока 2" name="playerSide" value="2" checked={playerSide === 2} onChange={() => setPlayerSide(2)} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleStart}
                        className="w-full mt-2 p-3 rounded-lg font-semibold transition-colors duration-200 bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                        Начать игру
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIConfigModal;