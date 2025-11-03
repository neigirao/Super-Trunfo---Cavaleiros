/**
 * Hook para gerenciar efeitos visuais da batalha
 * 
 * Responsabilidades:
 * - Controle de efeitos de vitória/derrota
 * - Partículas e animações
 * - Sistema de progressão (XP, nível)
 * 
 * @example
 * ```tsx
 * const effects = useBattleEffects();
 * 
 * // Mostrar efeito de vitória
 * effects.showVictory('victory');
 * 
 * // Adicionar XP
 * effects.addExperience(15);
 * ```
 */
import { useState, useCallback } from 'react';

export type VictoryType = 'victory' | 'defeat' | 'draw';

interface PlayerLevel {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperience: number;
}

interface BattleEffectsHook {
  // Estados
  showVictoryEffect: boolean;
  victoryType: VictoryType;
  showParticles: boolean;
  showTutorial: boolean;
  playerLevel: PlayerLevel;
  
  // Ações
  showVictory: (type: VictoryType) => void;
  hideVictory: () => void;
  showParticlesEffect: () => void;
  hideParticlesEffect: () => void;
  toggleTutorial: (show: boolean) => void;
  addExperience: (xp: number) => void;
  resetEffects: () => void;
}

/**
 * Hook para gerenciar efeitos visuais e progressão
 */
export const useBattleEffects = (): BattleEffectsHook => {
  const [showVictoryEffect, setShowVictoryEffect] = useState(false);
  const [victoryType, setVictoryType] = useState<VictoryType>('victory');
  const [showParticles, setShowParticles] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [playerLevel, setPlayerLevel] = useState<PlayerLevel>({ 
    level: 1, 
    experience: 0, 
    experienceToNextLevel: 100, 
    totalExperience: 0 
  });

  /**
   * Mostra efeito de vitória/derrota/empate
   */
  const showVictory = useCallback((type: VictoryType) => {
    setVictoryType(type);
    setShowVictoryEffect(true);
    
    if (type === 'victory') {
      setShowParticles(true);
    }
  }, []);

  /**
   * Esconde efeito de vitória
   */
  const hideVictory = useCallback(() => {
    setShowVictoryEffect(false);
  }, []);

  /**
   * Mostra partículas
   */
  const showParticlesEffect = useCallback(() => {
    setShowParticles(true);
  }, []);

  /**
   * Esconde partículas
   */
  const hideParticlesEffect = useCallback(() => {
    setShowParticles(false);
  }, []);

  /**
   * Toggle do tutorial
   */
  const toggleTutorial = useCallback((show: boolean) => {
    setShowTutorial(show);
  }, []);

  /**
   * Adiciona experiência ao jogador
   */
  const addExperience = useCallback((xp: number) => {
    setPlayerLevel(prev => {
      let newExperience = prev.experience + xp;
      let newLevel = prev.level;
      let newExpToNext = prev.experienceToNextLevel;

      // Verifica level up
      while (newExperience >= newExpToNext) {
        newExperience -= newExpToNext;
        newLevel++;
        newExpToNext = Math.floor(newExpToNext * 1.5);
      }

      return {
        level: newLevel,
        experience: newExperience,
        experienceToNextLevel: newExpToNext,
        totalExperience: prev.totalExperience + xp
      };
    });
  }, []);

  /**
   * Reseta todos os efeitos
   */
  const resetEffects = useCallback(() => {
    setShowVictoryEffect(false);
    setVictoryType('victory');
    setShowParticles(false);
  }, []);

  return {
    showVictoryEffect,
    victoryType,
    showParticles,
    showTutorial,
    playerLevel,
    showVictory,
    hideVictory,
    showParticlesEffect,
    hideParticlesEffect,
    toggleTutorial,
    addExperience,
    resetEffects
  };
};
