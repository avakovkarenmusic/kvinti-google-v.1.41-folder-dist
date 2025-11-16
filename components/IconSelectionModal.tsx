import React from 'react';
import { CROWN_ICONS } from './CrownIcons';

interface IconSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: React.FC) => void;
}

const IconSelectionModal: React.FC<IconSelectionModalProps> = ({ isOpen, onClose, onSelectIcon }) => {
  if (!isOpen) {
    return null;
  }

  const handleIconClick = (IconComponent: React.FC) => {
    onSelectIcon(IconComponent);
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
        className="bg-gray-800 rounded-lg shadow-2xl p-6 m-4 w-full max-w-md border border-gray-700"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Choose a Crown</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {/* FIX: Use imported CROWN_ICONS directly */}
          {CROWN_ICONS.map(({ id, component: IconComponent }) => (
            <button
              key={id} 
              onClick={() => handleIconClick(IconComponent)}
              className="aspect-square bg-gray-700/50 rounded-lg p-3 flex items-center justify-center
                         hover:bg-indigo-600/50 hover:scale-110 transition-all duration-200 ring-2 ring-transparent hover:ring-indigo-400 focus:outline-none focus:ring-indigo-400"
              title={`Crown ${id}`}
              aria-label={`Select Crown ${id}`}
            >
              <div className="w-full h-full text-white">
                <IconComponent />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconSelectionModal;