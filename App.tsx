import React, { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import MoveHistory from './components/MoveHistory';
import MenuModal from './components/MenuModal';
import SettingsPanel from './components/SettingsPanel';
import GameOverModal from './components/GameOverModal';
import AIConfigModal, { AIConfig, AIDifficulty } from './components/AIConfigModal';
import { CrownIcon } from './components/CrownIcons';
import { BOARD_SIZE } from './constants';
import type { Position, Piece, ColorOption } from './types';
import { positionToNotation } from './utils';
import { getAllValidActionsForPiece } from './gameLogic';
import { calculateAIMove, generateAllPossibleMoves } from './ai';


const INITIAL_PIECES: Piece[] = [
  // Player 1
  { key: 'WK', id: 'FK', player: 1, pos: { row: 6, col: 3 } }, // d1
  { key: 'W5', id: 'F5', player: 1, pos: { row: 6, col: 2 } }, // c1
  { key: 'W4', id: 'F4', player: 1, pos: { row: 5, col: 2 } }, // c2
  { key: 'W3', id: 'F3', player: 1, pos: { row: 5, col: 3 } }, // d2
  { key: 'W1', id: 'F1', player: 1, pos: { row: 6, col: 4 } }, // e1
  { key: 'W2', id: 'F2', player: 1, pos: { row: 5, col: 4 } }, // e2
  // Player 2
  { key: 'BK', id: 'FK', player: 2, pos: { row: 0, col: 3 } }, // d7
  { key: 'B2', id: 'F2', player: 2, pos: { row: 1, col: 2 } }, // c6
  { key: 'B1', id: 'F1', player: 2, pos: { row: 0, col: 2 } }, // c7
  { key: 'B3', id: 'F3', player: 2, pos: { row: 1, col: 3 } }, // d6
  { key: 'B4', id: 'F4', player: 2, pos: { row: 1, col: 4 } }, // e6
  { key: 'B5', id: 'F5', player: 2, pos: { row: 0, col: 4 } }, // e7
];

const INITIAL_PLAYER = 1;

interface HistoryEntry {
  pieces: Piece[];
  currentPlayer: number;
  move: string | null;
}

const INITIAL_HISTORY: HistoryEntry[] = [{
  pieces: INITIAL_PIECES,
  currentPlayer: INITIAL_PLAYER,
  move: null,
}];

const getGameStateHash = (pieces: Piece[], currentPlayer: number): string => {
    const sortedPieces = [...pieces].sort((a, b) => a.key.localeCompare(b.key));
    const piecePositions = sortedPieces.map(p => `${p.key}:${p.pos.row},${p.pos.col}`).join(';');
    return `${piecePositions}|player:${currentPlayer}`;
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('color-theme');
    if (storedPrefs === 'light' || storedPrefs === 'dark') {
      return storedPrefs;
    }
  }
  // По умолчанию темная тема, если в хранилище нет предпочтений
  return 'dark';
};

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [validCaptures, setValidCaptures] = useState<Position[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [player1Color, setPlayer1Color] = useState<ColorOption>({ name: 'Синий', from: 'from-blue-500', to: 'to-indigo-600', textColor: 'text-blue-600 dark:text-blue-400', shadowColor: '#3b82f6' });
  const [player2Color, setPlayer2Color] = useState<ColorOption>({ name: 'Красный', from: 'from-red-500', to: 'to-rose-600', textColor: 'text-red-600 dark:text-red-500', shadowColor: '#ef4444' });
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<{
    enabled: boolean;
    aiPlayer: 1 | 2;
    humanPlayer: 1 | 2;
    difficulty: AIDifficulty;
  } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<number>(500);
  const [isMoveAnimating, setIsMoveAnimating] = useState(false);
  const [glowBrightness, setGlowBrightness] = useState<number>(15);
  const [glowDiffusion, setGlowDiffusion] = useState<number>(8);
  const [isGlowEnabled, setIsGlowEnabled] = useState(true);

  useLayoutEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('color-theme', theme);
    } catch (e) {
      console.warn("Could not save theme to local storage.", e);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--glow-blur', `${glowDiffusion * 2.5}px`);
    document.documentElement.style.setProperty('--glow-spread', `${glowDiffusion}px`);
  }, [glowDiffusion]);

  const currentGameState = history[currentMoveIndex];
  const pieces = currentGameState.pieces;
  const currentPlayer = currentGameState.currentPlayer;
  
  // If playing vs AI as player 2, swap the colors so the user gets "their" color (p1)
  const isHumanVsAiAndHumanIsPlayer2 = aiConfig?.enabled && aiConfig.humanPlayer === 2;
  const resolvedPlayer1Color = isHumanVsAiAndHumanIsPlayer2 ? player2Color : player1Color;
  const resolvedPlayer2Color = isHumanVsAiAndHumanIsPlayer2 ? player1Color : player2Color;

  const baseGlowColor = currentPlayer === 1 ? resolvedPlayer1Color.shadowColor : resolvedPlayer2Color.shadowColor;
  const glowAlpha = Math.round(glowBrightness / 100 * 255).toString(16).padStart(2, '0');
  const glowColor = isGlowEnabled ? `${baseGlowColor}${glowAlpha}` : 'transparent';

  const resetGame = useCallback(() => {
    setHistory(INITIAL_HISTORY);
    setCurrentMoveIndex(0);
    setSelectedPiece(null);
    setValidMoves([]);
    setValidCaptures([]);
    setGameOverMessage(null);
    setIsMoveAnimating(false);
  }, []);
  
  const handleNewGame = useCallback(() => {
    resetGame();
    setAiConfig(null);
    setIsMenuOpen(false);
  }, [resetGame]);
  
  const handleStartAIGame = useCallback((config: AIConfig) => {
    resetGame();
    const humanPlayer = config.playerSide;
    const aiPlayer = humanPlayer === 1 ? 2 : 1;
    setAiConfig({
      enabled: true,
      aiPlayer: aiPlayer,
      humanPlayer: humanPlayer,
      difficulty: config.difficulty
    });
    setIsAIConfigOpen(false);
  }, [resetGame]);

  const handleHistoryClick = useCallback((index: number) => {
    setCurrentMoveIndex(index);
    setSelectedPiece(null);
    setValidMoves([]);
    setValidCaptures([]);
  }, []);

  const handleNavigateHistory = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentMoveIndex - 1 : currentMoveIndex + 1;
    if (newIndex >= 0 && newIndex < history.length) {
        handleHistoryClick(newIndex);
    }
  }, [currentMoveIndex, history.length, handleHistoryClick]);

  const makeMove = useCallback((pieceToMove: Piece, targetPosition: Position) => {
    const isCaptureValid = pieces.some(p => p.pos.row === targetPosition.row && p.pos.col === targetPosition.col && p.player !== pieceToMove.player);
      
    const newHistory = history.slice(0, currentMoveIndex + 1);
    const capturedPiece = isCaptureValid ? pieces.find(p => p.pos.row === targetPosition.row && p.pos.col === targetPosition.col) : null;

    let newPieces = pieces.map(p => 
        p.key === pieceToMove.key ? { ...p, pos: targetPosition } : p
    );

    if (isCaptureValid) {
        newPieces = newPieces.filter(p => !(p.pos.row === targetPosition.row && p.pos.col === targetPosition.col && p.key !== pieceToMove.key));
    }
    
    const fromNotation = positionToNotation(pieceToMove.pos);
    const toNotation = positionToNotation(targetPosition);
    
    const moveString = isCaptureValid && capturedPiece
      ? `${pieceToMove.id}: ${fromNotation}-${toNotation}x${capturedPiece.id}`
      : `${pieceToMove.id}: ${fromNotation}-${toNotation}`;

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    const newGameState: HistoryEntry = {
        pieces: newPieces,
        currentPlayer: nextPlayer,
        move: moveString,
    };

    const updatedHistory = [...newHistory, newGameState];
    
    // Trigger animation and lock board
    setIsMoveAnimating(true);
    setHistory(updatedHistory);
    setCurrentMoveIndex(updatedHistory.length - 1);
    setSelectedPiece(null);
    setValidMoves([]);
    setValidCaptures([]);

    // Delay game over checks to allow animation to finish
    setTimeout(() => {
      // --- CHECK FOR GAME OVER ---
      if (capturedPiece && capturedPiece.id === 'FK') {
          setGameOverMessage(`Игрок ${currentPlayer} победил, захватив Квинти!`);
      } else {
        const opponentHasPieces = newPieces.some(p => p.player !== currentPlayer);
        if (!opponentHasPieces) {
            setGameOverMessage(`Игрок ${currentPlayer} победил!`);
        } else {
            const newGameStateHash = getGameStateHash(newPieces, nextPlayer);
            const repetitionsInHistory = history
              .slice(0, currentMoveIndex + 1)
              .filter(entry => getGameStateHash(entry.pieces, entry.currentPlayer) === newGameStateHash)
              .length;
            
            if (repetitionsInHistory + 1 >= 3) {
                setGameOverMessage("Ничья: троекратное повторение позиции!");
            }
        }
      }
      setIsMoveAnimating(false); // Unlock board after checks
    }, isAnimationEnabled ? animationSpeed + 50 : 0);
  }, [history, currentMoveIndex, pieces, currentPlayer, isAnimationEnabled, animationSpeed]);
  
  useEffect(() => {
    if (gameOverMessage || !aiConfig?.enabled || currentPlayer !== aiConfig.aiPlayer) {
      return;
    }
    const isAITurn = !gameOverMessage && aiConfig?.enabled && currentPlayer === aiConfig.aiPlayer;

    if(isAITurn) {
        const timer = setTimeout(() => {
            try {
                let aiMove;
                // Make AI's first move of the game random
                const isAIsFirstMove = (aiConfig.aiPlayer === 1 && currentMoveIndex === 0) || (aiConfig.aiPlayer === 2 && currentMoveIndex === 1);

                if (isAIsFirstMove) {
                    const allMoves = generateAllPossibleMoves(pieces, aiConfig.aiPlayer);
                    if (allMoves.length > 0) {
                        aiMove = allMoves[Math.floor(Math.random() * allMoves.length)];
                    }
                } else {
                    aiMove = calculateAIMove(pieces, aiConfig.aiPlayer, aiConfig.difficulty);
                }
                
                if (aiMove) {
                    makeMove(aiMove.piece, aiMove.target);
                } else {
                    console.error("AI could not determine a move.");
                }
            } catch (error) {
                console.error("AI failed to make a move:", error);
            }
        }, 800); // AI "thinking" time
        
        return () => clearTimeout(timer);
    }
  }, [currentPlayer, pieces, aiConfig, gameOverMessage, makeMove, currentMoveIndex]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameOverMessage || isMoveAnimating) return;
    if (aiConfig?.enabled && currentPlayer === aiConfig.aiPlayer) return; // Ignore clicks during AI's turn

    const clickedPiece = pieces.find(p => p.pos.row === row && p.pos.col === col);

    const isCaptureValid = validCaptures.some(cap => cap.row === row && cap.col === col);
    const isMoveValid = validMoves.some(move => move.row === row && move.col === col);

    if (selectedPiece && (isMoveValid || isCaptureValid)) {
      makeMove(selectedPiece, { row, col });
    } else if (clickedPiece && clickedPiece.player === currentPlayer) {
        if (selectedPiece?.key === clickedPiece.key) {
            setSelectedPiece(null);
            setValidMoves([]);
            setValidCaptures([]);
        } else {
            setSelectedPiece(clickedPiece);
            const { moves, captures } = getAllValidActionsForPiece(clickedPiece, pieces);
            setValidMoves(moves);
            setValidCaptures(captures);
        }
    } else {
        setSelectedPiece(null);
        setValidMoves([]);
        setValidCaptures([]);
    }
  }, [selectedPiece, pieces, currentPlayer, validMoves, validCaptures, history, currentMoveIndex, gameOverMessage, aiConfig, makeMove, isMoveAnimating]);
  
  // Flip the board if the user is Player 2 playing against the AI
  const isBoardFlipped = !!aiConfig?.enabled && aiConfig.humanPlayer === 2;

  return (
    <main className="h-screen w-screen p-4 flex flex-col gap-4 font-sans transition-colors duration-300 bg-gray-100 dark:bg-gray-900">
      <MenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNewGame={handleNewGame}
        onStartAIConfig={() => setIsAIConfigOpen(true)}
        glowColor={glowColor}
      />
      <AIConfigModal
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
        onStartGame={handleStartAIGame}
        glowColor={glowColor}
      />
      <GameOverModal
        isOpen={!!gameOverMessage}
        message={gameOverMessage || ''}
        onNewGame={handleNewGame}
        glowColor={glowColor}
      />
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        player1Color={player1Color}
        player2Color={player2Color}
        onPlayer1ColorChange={setPlayer1Color}
        onPlayer2ColorChange={setPlayer2Color}
        theme={theme}
        onThemeChange={setTheme}
        isAnimationEnabled={isAnimationEnabled}
        onAnimationToggle={setIsAnimationEnabled}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={setAnimationSpeed}
        glowColor={glowColor}
        glowBrightness={glowBrightness}
        onGlowBrightnessChange={setGlowBrightness}
        glowDiffusion={glowDiffusion}
        onGlowDiffusionChange={setGlowDiffusion}
        isGlowEnabled={isGlowEnabled}
        onGlowEnabledChange={setIsGlowEnabled}
      />
      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-1">
        
        {/* Glow Layer (z-0) */}
        <div className="[grid-area:1/1] z-0 flex flex-col gap-4 landscape:flex-row pointer-events-none">
            {/* Glow for Left Column */}
            <div className="flex flex-col gap-4 landscape:w-[32rem]">
                {/* Glow for GameInfo */}
                <div 
                    className="w-full rounded-lg p-2 border border-transparent container-glow"
                    style={{ '--glow-color': glowColor }}
                >
                    <div className="h-10" />
                </div>
                {/* Glow for MoveHistory (Landscape) */}
                <div className="hidden landscape:flex flex-1 min-h-0">
                    <div 
                        className="w-full h-full rounded-lg container-glow"
                        style={{ '--glow-color': glowColor }}
                    />
                </div>
            </div>

            {/* Glow for Board */}
            <div className="flex landscape:flex-1 items-center justify-center">
                <div className="relative w-full h-auto aspect-square max-h-full landscape:w-auto landscape:h-full">
                    <div 
                        className="w-full h-full rounded-lg p-0.5 border border-transparent container-glow"
                        style={{ '--glow-color': glowColor }}
                    />
                </div>
            </div>

            {/* Glow for MoveHistory (Portrait) */}
            <div className="flex-1 min-h-0 landscape:hidden">
                <div 
                    className="w-full h-full rounded-lg container-glow"
                    style={{ '--glow-color': glowColor }}
                />
            </div>
        </div>

        {/* Content Layer (z-10) */}
        <div className="[grid-area:1/1] z-10 flex flex-col gap-4 landscape:flex-row">
            <div className="flex flex-col gap-4 landscape:w-[32rem]">
                <GameInfo 
                    currentPlayer={currentPlayer} 
                    onMenuClick={() => setIsMenuOpen(true)}
                    onDesignClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                    isPanelOpen={isSettingsPanelOpen}
                    player1Color={resolvedPlayer1Color}
                    player2Color={resolvedPlayer2Color}
                />
                <div className="hidden landscape:flex flex-1 min-h-0">
                    <MoveHistory 
                        history={history}
                        currentMoveIndex={currentMoveIndex}
                        onHistoryClick={handleHistoryClick}
                        onNavigateHistory={handleNavigateHistory}
                        player1Color={resolvedPlayer1Color}
                        player2Color={resolvedPlayer2Color}
                    />
                </div>
            </div>
            
            <div className="flex landscape:flex-1 items-center justify-center">
                <div className="relative w-full h-auto aspect-square max-h-full landscape:w-auto landscape:h-full">
                    <GameBoard 
                        pieces={pieces}
                        selectedPiece={selectedPiece}
                        validMoves={validMoves}
                        validCaptures={validCaptures}
                        onCellClick={handleCellClick}
                        currentPlayer={currentPlayer}
                        crownIcon={CrownIcon}
                        player1Color={resolvedPlayer1Color}
                        player2Color={resolvedPlayer2Color}
                        isAnimationEnabled={isAnimationEnabled}
                        animationSpeed={animationSpeed}
                        isBoardFlipped={isBoardFlipped}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 landscape:hidden">
                <MoveHistory 
                    history={history}
                    currentMoveIndex={currentMoveIndex}
                    onHistoryClick={handleHistoryClick}
                    onNavigateHistory={handleNavigateHistory}
                    player1Color={resolvedPlayer1Color}
                    player2Color={resolvedPlayer2Color}
                />
            </div>
        </div>
      </div>
    </main>
  );
};

export default App;