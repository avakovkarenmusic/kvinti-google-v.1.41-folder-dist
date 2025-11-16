import React from 'react';

interface GameControlsProps {
  dotRadius: number;
  dotSpacing: number;
  onRadiusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSpacingChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenModal: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ dotRadius, dotSpacing, onRadiusChange, onSpacingChange, onOpenModal }) => {
  return (
    <div className="w-full text-center landscape:w-auto p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-300">Display Controls</h3>
      <div className="flex flex-col gap-2">
        <label htmlFor="dotRadius" className="flex justify-between text-sm text-gray-400">
          <span>Dot Size</span>
          <span className="font-mono">{dotRadius.toFixed(1)}</span>
        </label>
        <input
          type="range"
          id="dotRadius"
          name="dotRadius"
          min="0.5"
          max="5"
          step="0.1"
          value={dotRadius}
          onChange={onRadiusChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="dotSpacing" className="flex justify-between text-sm text-gray-400">
          <span>Dot Spacing</span>
          <span className="font-mono">{dotSpacing.toFixed(1)}</span>
        </label>
        <input
          type="range"
          id="dotSpacing"
          name="dotSpacing"
          min="1"
          max="12"
          step="0.1"
          value={dotSpacing}
          onChange={onSpacingChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
      <button 
        onClick={onOpenModal}
        className="w-full px-4 py-2 mt-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all"
      >
        Choose Crown
      </button>
    </div>
  );
};

export default GameControls;