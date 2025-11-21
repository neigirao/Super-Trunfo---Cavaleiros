/**
 * Arena de Batalha V2 - Layout "Arena Centralizada"
 * FASE 1 & 2: Novo layout com foco nas cartas
 * 
 * Hierarquia:
 * 1. Top Bar (compacto) - 14 (56px)
 * 2. Arena Central (70-80% altura) - CARTAS EM DESTAQUE
 * 3. Bottom Bar (compacto) - progresso unificado
 */
import { motion, AnimatePresence } from 'framer-motion';
import BattleField from './BattleField';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import EnhancedTurnIndicator from './EnhancedTurnIndicator';
import ThinkingIndicator from './ThinkingIndicator';
import VictoryEffect from '../effects/VictoryEffect';
import ParticleEffect from '../effects/ParticleEffect';
import AttributeConnection from './AttributeConnection';
import type { useBattleLogic, BattleAttribute } from '@/hooks/battle/useBattleLogic';
import type { useBattleState } from '@/hooks/battle/useBattleState';
import type { useBattleEffects } from '@/hooks/battle/useBattleEffects';

interface BattleArenaV2Props {
  logic: ReturnType<typeof useBattleLogic>;
  state: ReturnType<typeof useBattleState>;
  effects: ReturnType<typeof useBattleEffects>;
  actions: {
    selectAttribute: (attribute: BattleAttribute) => void;
    calculatePower: (card: any) => number;
    skipTimer: () => void;
  };
  onSurrender: () => void;
}

/**
 * Arena principal de batalha - Versão 2
 */
const BattleArenaV2 = ({ logic, state, effects, actions, onSurrender }: BattleArenaV2Props) => {
  // Calcular tempo restante do timer
  const [timeRemaining, setTimeRemaining] = React.useState(5);

  React.useEffect(() => {
    if (state.isTimerActive) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setTimeRemaining(5);
    }
  }, [state.isTimerActive]);

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-background">
      {/* TOP BAR - Compacto e Responsivo */}
      <TopBar
        round={logic.battle.round}
        isPaused={state.isPaused}
        onPause={() => state.setPaused(true)}
        onResume={() => state.setPaused(false)}
        onSurrender={onSurrender}
        timerActive={state.isTimerActive}
        timeRemaining={timeRemaining}
        onSkipTimer={actions.skipTimer}
      />

      {/* ARENA CENTRAL - 70-80% da altura (FOCO NAS CARTAS) */}
      <div className="flex-1 relative flex items-center justify-center p-2 md:p-4 lg:p-6 min-h-0 overflow-y-auto">
        {/* Indicador de Turno - Overlay central */}
        <EnhancedTurnIndicator
          whoChooses={logic.whoChooses}
          isActive={
            !logic.battle.selectedAttribute && 
            !state.isPaused && 
            state.gamePhase === 'battle'
          }
        />

        {/* Conexão de Atributos - Overlay */}
        <AnimatePresence>
          {state.showAttributeConnection && logic.battle.selectedAttribute && (
            <AttributeConnection
              selectedAttribute={logic.battle.selectedAttribute}
              playerValue={logic.battle.playerCard?.[logic.battle.selectedAttribute] || 0}
              opponentValue={logic.battle.opponentCard?.[logic.battle.selectedAttribute] || 0}
              isVisible={state.showAttributeConnection}
            />
          )}
        </AnimatePresence>

        {/* Campo de Batalha - CARTAS (Mobile Optimized) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <BattleField
            playerCard={logic.battle.playerCard}
            opponentCard={logic.battle.opponentCard}
            isCardFlipped={state.isCardFlipped}
            isTransferring={state.isTransferring}
            transferDirection={state.transferDirection}
            showPlayerAttributes={true}
            canSelectAttribute={
              logic.whoChooses === 'player' && 
              !logic.battle.selectedAttribute && 
              !state.isPaused
            }
            onAttributeSelect={actions.selectAttribute}
            selectedAttribute={logic.battle.selectedAttribute}
          />
        </motion.div>

        {/* Indicador de Pensamento do Oponente (Mobile Optimized) */}
        {logic.whoChooses === 'opponent' && !logic.battle.selectedAttribute && (
          <motion.div 
            className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ThinkingIndicator isVisible={true} />
          </motion.div>
        )}
      </div>

      {/* BOTTOM BAR - Compacto e Responsivo */}
      <BottomBar
        playerCards={logic.battle.playerDeck.length}
        opponentCards={logic.battle.opponentDeck.length}
        initialPlayerCards={logic.initialPlayerCards}
        initialOpponentCards={logic.initialOpponentCards}
        playerLevel={effects.playerLevel.level}
        currentXP={effects.playerLevel.experience}
        xpToNextLevel={effects.playerLevel.experienceToNextLevel}
      />

      {/* Efeitos Visuais - Overlay */}
      <AnimatePresence>
        {effects.showVictoryEffect && (
          <VictoryEffect 
            isVisible={effects.showVictoryEffect} 
            type={effects.victoryType} 
          />
        )}
      </AnimatePresence>

      {effects.showParticles && (
        <ParticleEffect isActive={effects.showParticles} />
      )}
    </div>
  );
};

// Importar React no topo
import React from 'react';

export default BattleArenaV2;
