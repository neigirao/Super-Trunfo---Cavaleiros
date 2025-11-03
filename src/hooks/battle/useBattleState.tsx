/**
 * Hook para gerenciar o estado da UI da batalha
 * 
 * Responsabilidades:
 * - Estado da fase do jogo
 * - Estado de animações e transições
 * - Estado de controles (pausa, etc)
 * 
 * @example
 * ```tsx
 * const battleState = useBattleState();
 * 
 * // Controlar fases
 * battleState.setGamePhase('battle');
 * 
 * // Controlar animações
 * battleState.startCardFlip();
 * battleState.startTransfer('left');
 * ```
 */
import { useState, useCallback } from 'react';

export type GamePhase = 'deckBuilder' | 'battle' | 'result' | 'gameOver';
export type VictoryType = 'victory' | 'defeat' | 'draw';

interface BattleStateHook {
  // Estados
  gamePhase: GamePhase;
  isCardFlipped: boolean;
  isTransferring: boolean;
  transferDirection: 'left' | 'right';
  currentDeckName: string | null;
  isPaused: boolean;
  previousPlayerPower: number;
  previousOpponentPower: number;
  
  // Ações
  setGamePhase: (phase: GamePhase) => void;
  setCardFlipped: (flipped: boolean) => void;
  setTransferring: (transferring: boolean) => void;
  setTransferDirection: (direction: 'left' | 'right') => void;
  setCurrentDeckName: (name: string | null) => void;
  setPaused: (paused: boolean) => void;
  setPreviousPowers: (playerPower: number, opponentPower: number) => void;
  resetState: () => void;
}

/**
 * Hook para gerenciar estado da UI da batalha
 */
export const useBattleState = (): BattleStateHook => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('deckBuilder');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferDirection, setTransferDirection] = useState<'left' | 'right'>('right');
  const [currentDeckName, setCurrentDeckName] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [previousPlayerPower, setPreviousPlayerPower] = useState(0);
  const [previousOpponentPower, setPreviousOpponentPower] = useState(0);

  /**
   * Define os poderes anteriores para animação
   */
  const setPreviousPowers = useCallback((playerPower: number, opponentPower: number) => {
    setPreviousPlayerPower(playerPower);
    setPreviousOpponentPower(opponentPower);
  }, []);

  /**
   * Reseta todos os estados para valores iniciais
   */
  const resetState = useCallback(() => {
    setGamePhase('deckBuilder');
    setIsCardFlipped(false);
    setIsTransferring(false);
    setTransferDirection('right');
    setCurrentDeckName(null);
    setIsPaused(false);
    setPreviousPlayerPower(0);
    setPreviousOpponentPower(0);
  }, []);

  return {
    gamePhase,
    isCardFlipped,
    isTransferring,
    transferDirection,
    currentDeckName,
    isPaused,
    previousPlayerPower,
    previousOpponentPower,
    setGamePhase,
    setCardFlipped: setIsCardFlipped,
    setTransferring: setIsTransferring,
    setTransferDirection,
    setCurrentDeckName,
    setPaused: setIsPaused,
    setPreviousPowers,
    resetState
  };
};
