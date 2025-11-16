import React, { useRef, useEffect, useState } from 'react';
import { ColorOption } from '../types';
import { CrownIcon } from './CrownIcons';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player1Color: ColorOption;
  player2Color: ColorOption;
  onPlayer1ColorChange: (color: ColorOption) => void;
  onPlayer2ColorChange: (color: ColorOption) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  isAnimationEnabled: boolean;
  onAnimationToggle: (enabled: boolean) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (value: number) => void;
  glowColor: string;
  glowBrightness: number;
  onGlowBrightnessChange: (value: number) => void;
  glowDiffusion: number;
  onGlowDiffusionChange: (value: number) => void;
  isGlowEnabled: boolean;
  onGlowEnabledChange: (enabled: boolean) => void;
}

const COLORS: ColorOption[] = [
    { name: 'Красный', from: 'from-red-500', to: 'to-rose-600', textColor: 'text-red-600 dark:text-red-500', shadowColor: '#ef4444' },
    { name: 'Оранжевый', from: 'from-orange-400', to: 'to-orange-500', textColor: 'text-orange-600 dark:text-orange-400', shadowColor: '#f97316' },
    { name: 'Желтый', from: 'from-yellow-400', to: 'to-amber-500', textColor: 'text-amber-600 dark:text-amber-400', shadowColor: '#f59e0b' },
    { name: 'Салатовый', from: 'from-lime-400', to: 'to-green-500', textColor: 'text-lime-600 dark:text-lime-400', shadowColor: '#84cc16' },
    { name: 'Голубой', from: 'from-cyan-400', to: 'to-sky-500', textColor: 'text-cyan-600 dark:text-cyan-400', shadowColor: '#06b6d4' },
    { name: 'Синий', from: 'from-blue-500', to: 'to-indigo-600', textColor: 'text-blue-600 dark:text-blue-400', shadowColor: '#3b82f6' },
    { name: 'Фиолетовый', from: 'from-violet-500', to: 'to-purple-600', textColor: 'text-violet-600 dark:text-violet-400', shadowColor: '#8b5cf6' },
    { name: 'Розовый', from: 'from-pink-500', to: 'to-fuchsia-600', textColor: 'text-pink-600 dark:text-pink-400', shadowColor: '#ec4899' },
    { name: 'Белый', from: 'from-gray-100', to: 'to-gray-300', extra: 'border-2 border-gray-400', textColor: 'text-gray-700 dark:text-gray-300', shadowColor: '#9ca3af' },
    { name: 'Черный', from: 'from-gray-800', to: 'to-black', textColor: 'text-black dark:text-gray-300', shadowColor: '#6b7280' },
];

const BrightnessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const DiffusionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
);

const SpeedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
    </svg>
);

// Animation speed mapping
const SPEED_LEVELS_MS = [1500, 1200, 1000, 800, 650, 500, 400, 300, 200, 100]; // 10 levels from 1 to 10

const msToSpeedLevel = (ms: number): number => {
  const closest = SPEED_LEVELS_MS.reduce((prev, curr) => 
    (Math.abs(curr - ms) < Math.abs(prev - ms) ? curr : prev)
  );
  const index = SPEED_LEVELS_MS.indexOf(closest);
  return index + 1;
};

const speedLevelToMs = (level: number): number => {
  return SPEED_LEVELS_MS[level - 1];
};

const DraggableInput: React.FC<{
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled: boolean;
  unit?: string;
  label: string;
  iconRef?: React.RefObject<HTMLDivElement>;
}> = ({ icon, value, onChange, min, max, step = 1, disabled, unit, label, iconRef }) => {
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null);

  const handleInteractionStart = (clientY: number) => {
    if (disabled) return;
    dragRef.current = { startY: clientY, startValue: value };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleInteractionEnd);
  };

  const handleInteractionMove = (clientY: number) => {
    if (!dragRef.current) return;
    const deltaY = dragRef.current.startY - clientY; // Upward move is positive delta
    const sensitivity = 5; // Pixels per unit change
    const valueChange = Math.round(deltaY / sensitivity) * step;

    let newValue = dragRef.current.startValue + valueChange;
    newValue = Math.max(min, Math.min(max, newValue)); // Clamp value
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleInteractionEnd = () => {
    dragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleInteractionEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleInteractionEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientY);
  };
  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleInteractionMove(e.clientY);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteractionStart(e.touches[0].clientY);
  };
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scroll while dragging value
    handleInteractionMove(e.touches[0].clientY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let newValue = value;
    if (e.key === 'ArrowUp') {
      newValue = Math.min(max, value + step);
    } else if (e.key === 'ArrowDown') {
      newValue = Math.max(min, value - step);
    }
    if (newValue !== value) {
      onChange(newValue);
      e.preventDefault();
    }
  };

  return (
    <div
      className={`flex items-center gap-1 text-gray-700 dark:text-gray-300 ${!disabled ? 'cursor-ns-resize' : 'cursor-not-allowed'}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      aria-disabled={disabled}
    >
      <div ref={iconRef}>{icon}</div>
      <div className={`relative w-14 select-none bg-gray-200 dark:bg-gray-700 rounded-md py-1 px-2 text-center font-mono focus:outline-none ring-2 ring-transparent focus-visible:ring-indigo-400 ${disabled ? 'opacity-70' : ''}`}>
        <span>{value}</span>
        {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">{unit}</span>}
      </div>
    </div>
  );
};


const ColorSwatch: React.FC<{
  color: ColorOption;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}> = ({ color, isSelected, isDisabled, onClick }) => {
  const borderClass = isSelected ? 'ring-2 ring-offset-2 ring-indigo-400 ring-offset-white dark:ring-offset-gray-800' : '';
  const disabledClass = isDisabled ? 'grayscale opacity-50 cursor-not-allowed' : 'transform hover:scale-110';
  
  return (
    <button
      onClick={!isDisabled ? onClick : undefined}
      className={`w-7 h-7 rounded-full bg-gradient-to-br ${color.from} ${color.to} ${color.extra || ''} ${borderClass} ${disabledClass} transition-all flex-shrink-0`}
      aria-label={`Выбрать цвет ${color.name}`}
      disabled={isDisabled}
    />
  );
};

const PiecePreview: React.FC<{ color: ColorOption }> = ({ color }) => {
    const iconColorClass = (color.name === 'Белый') ? 'text-black/90' : 'text-white/90';
    return (
        <div className="w-24 h-24 landscape:w-16 landscape:h-16 rounded-full flex items-center justify-center p-1.5 bg-gray-200 dark:bg-gray-700/50 flex-shrink-0">
            <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${color.from} ${color.to} ${color.extra || ''}`}>
                <div className={`w-full h-full ${iconColorClass}`}>
                    <CrownIcon />
                </div>
            </div>
        </div>
    );
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  player1Color,
  player2Color,
  onPlayer1ColorChange,
  onPlayer2ColorChange,
  theme,
  onThemeChange,
  isAnimationEnabled,
  onAnimationToggle,
  animationSpeed,
  onAnimationSpeedChange,
  glowColor,
  glowBrightness,
  onGlowBrightnessChange,
  glowDiffusion,
  onGlowDiffusionChange,
  isGlowEnabled,
  onGlowEnabledChange
}) => {
    
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const animationLabelRef = useRef<HTMLSpanElement>(null);
  const speedIconRef = useRef<HTMLDivElement>(null);
  const [previewGlowColor, setPreviewGlowColor] = useState(glowColor);

  useEffect(() => {
    // Reset preview color when panel opens or when the main glow color changes.
    setPreviewGlowColor(glowColor);
  }, [glowColor, isOpen]);

  const handleColorSelection = (color: ColorOption, player: 1 | 2) => {
    if (player === 1) {
      onPlayer1ColorChange(color);
    } else {
      onPlayer2ColorChange(color);
    }
    const glowAlpha = Math.round(glowBrightness / 100 * 255).toString(16).padStart(2, '0');
    setPreviewGlowColor(`${color.shadowColor}${glowAlpha}`);
  };

  // Debounce effect for triggering the animation
  useEffect(() => {
    if (!isAnimationEnabled) return;

    const handler = setTimeout(() => {
        setAnimationTrigger(c => c + 1);
    }, 500); // Trigger animation 500ms after the last change

    return () => {
        clearTimeout(handler);
    };
  }, [animationSpeed, isAnimationEnabled]);

  // The animation effect itself
  useEffect(() => {
    if (animationTrigger === 0 || !speedIconRef.current || !animationLabelRef.current) return;
    
    const iconEl = speedIconRef.current;
    const startEl = animationLabelRef.current;
    
    const iconRect = iconEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();

    const animationStartX = startRect.right + 16;
    const iconCurrentX = iconRect.left;
    const translateDistance = animationStartX - iconCurrentX;
    
    iconEl.style.transition = 'none';
    iconEl.style.transform = `translateX(${translateDistance}px)`;
    
    // Force a browser reflow to apply the above styles before adding the transition.
    // This makes the animation reliably trigger on subsequent changes.
    void iconEl.offsetHeight;

    const frameId = requestAnimationFrame(() => {
      iconEl.style.transition = `transform ${animationSpeed}ms ease-in-out`;
      iconEl.style.transform = 'translateX(0)';
    });

    const timeoutId = setTimeout(() => {
      if (speedIconRef.current) {
        speedIconRef.current.style.transition = '';
      }
    }, animationSpeed);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationTrigger]);
    
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex justify-center p-4 z-40 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-lg landscape:max-w-none landscape:h-full"
        onClick={e => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 rounded-lg container-glow"
          style={{ '--glow-color': isGlowEnabled ? previewGlowColor : 'transparent' }}
        />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full h-full border border-gray-300 dark:border-gray-700 flex flex-col gap-6 overflow-y-auto">
            <div className="flex justify-between items-center text-gray-800 dark:text-white flex-shrink-0">
                <h2 className="text-2xl font-bold">Настройки</h2>
                 <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Закрыть">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div className="flex-1 min-h-0 flex flex-col gap-6 landscape:grid landscape:grid-cols-2 landscape:gap-x-4">
                {/* Player Colors */}
                <div className="flex flex-col gap-4">
                    {/* Player 1 */}
                    <div className="flex flex-row items-center gap-3">
                        <PiecePreview color={player1Color} />
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold mb-2 ${player1Color.textColor}`}>Игрок 1</h3>
                            <div className="grid grid-cols-5 gap-x-1 gap-y-2">
                                {COLORS.map(color => (
                                    <ColorSwatch 
                                        key={`p1-${color.name}`} 
                                        color={color} 
                                        isSelected={color.name === player1Color.name} 
                                        isDisabled={color.name === player2Color.name}
                                        onClick={() => handleColorSelection(color, 1)} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Player 2 */}
                    <div className="flex flex-row items-center gap-3">
                        <PiecePreview color={player2Color} />
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold mb-2 ${player2Color.textColor}`}>Игрок 2</h3>
                             <div className="grid grid-cols-5 gap-x-1 gap-y-2">
                                {COLORS.map(color => (
                                    <ColorSwatch 
                                        key={`p2-${color.name}`} 
                                        color={color} 
                                        isSelected={color.name === player2Color.name} 
                                        isDisabled={color.name === player1Color.name}
                                        onClick={() => handleColorSelection(color, 2)} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* General Settings */}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-6 landscape:border-t-0 landscape:pt-0 landscape:border-l landscape:pl-4">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-4">
                        {/* --- Dark Theme Row --- */}
                        <span className="text-gray-800 dark:text-gray-200 text-lg">Темная тема</span>
                        <div /> {/* Spacer */}
                        <div /> {/* Spacer */}
                        <label htmlFor="theme-toggle-input" className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                id="theme-toggle-input"
                                checked={theme === 'dark'}
                                onChange={(e) => onThemeChange(e.target.checked ? 'dark' : 'light')}
                                className="sr-only peer"
                            />
                            <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:transform peer-checked:translate-x-6"></div>
                        </label>

                        {/* --- Animation Row --- */}
                        <span ref={animationLabelRef} className="text-gray-800 dark:text-gray-200 text-lg">Анимация</span>
                        <div /> {/* Spacer */}
                        <div className={`transition-opacity duration-300 ${isAnimationEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <DraggableInput
                                icon={<SpeedIcon />}
                                value={msToSpeedLevel(animationSpeed)}
                                onChange={(level) => onAnimationSpeedChange(speedLevelToMs(level))}
                                min={1}
                                max={10}
                                step={1}
                                disabled={!isAnimationEnabled}
                                label="Animation Speed"
                                iconRef={speedIconRef}
                            />
                        </div>
                        <label htmlFor="animation-toggle-input" className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                id="animation-toggle-input"
                                checked={isAnimationEnabled}
                                onChange={(e) => onAnimationToggle(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:transform peer-checked:translate-x-6"></div>
                        </label>

                        {/* --- Glow Row --- */}
                        <span className="text-gray-800 dark:text-gray-200 text-lg">Подсветка</span>
                        <div className={`transition-opacity duration-300 ${isGlowEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <DraggableInput
                                icon={<BrightnessIcon />}
                                value={glowBrightness}
                                onChange={onGlowBrightnessChange}
                                min={0}
                                max={100}
                                unit="%"
                                disabled={!isGlowEnabled}
                                label="Glow Brightness"
                            />
                        </div>
                        <div className={`transition-opacity duration-300 ${isGlowEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <DraggableInput
                                icon={<DiffusionIcon />}
                                value={glowDiffusion}
                                onChange={onGlowDiffusionChange}
                                min={0}
                                max={20}
                                disabled={!isGlowEnabled}
                                label="Glow Diffusion"
                            />
                        </div>
                        <label htmlFor="glow-toggle-input" className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                id="glow-toggle-input"
                                checked={isGlowEnabled}
                                onChange={(e) => onGlowEnabledChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:transform peer-checked:translate-x-6"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;