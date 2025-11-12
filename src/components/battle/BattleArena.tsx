/**
 * Componente da arena de batalha
 * 
 * Renderiza a interface principal do combate:
 * - Controles (pause, surrender)
 * - Campo de batalha (cartas)
 * - Seletor de atributos
 * - Estatísticas (contadores, progresso)
 * - Efeitos visuais
 * 
 * @example
 * ```tsx
 * <BattleArena
 *   logic={battleLogic}
 *   state={battleState}
 *   effects={battleEffects}
 *   actions={battleActions}
 *   onSurrender={handleSurrender}
 * />
 * ```
 */
import { motion, AnimatePresence } from 'framer-motion';
import BattleField from './BattleField';
import BattleControls from './BattleControls';
import TurnIndicator from './TurnIndicator';
import CardCounter from './CardCounter';
import BattleProgress from './BattleProgress';
import ThinkingIndicator from './ThinkingIndicator';
import VictoryEffect from '../effects/VictoryEffect';
import ParticleEffect from '../effects/ParticleEffect';
import PlayerLevel from '../progression/PlayerLevel';
import AttributeConnection from './AttributeConnection';
import type { useBattleLogic, BattleAttribute } from '@/hooks/battle/useBattleLogic';
import type { useBattleState } from '@/hooks/battle/useBattleState';
import type { useBattleEffects } from '@/hooks/battle/useBattleEffects';

interface BattleArenaProps {
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
 * Arena principal de batalha
 */
const BattleArena = ({ logic, state, effects, actions, onSurrender }: BattleArenaProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto max-w-6xl py-2 space-y-2"
    >
      {/* 1) MENU - Controles principais da batalha */}
      <div className="flex items-center justify-between">
        <BattleControls
          onSurrender={onSurrender}
          onPause={() => state.setPaused(true)}
          onResume={() => state.setPaused(false)}
          isPaused={state.isPaused}
        />
      </div>

      {/* 2) ESTATÍSTICAS ACIMA DAS CARTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardCounter
          playerCards={logic.battle.playerDeck.length}
          opponentCards={logic.battle.opponentDeck.length}
        />
        <div className="flex items-center gap-3">
          <TurnIndicator
            whoChooses={logic.whoChooses}
            isActive={!state.isPaused && logic.whoChooses === 'player'}
          />
          {state.isTimerActive && (
            <motion.button
              onClick={actions.skipTimer}
              className="px-4 py-2 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light text-cosmic-dark-foreground dark:text-cosmic-dark font-semibold rounded-full shadow-lg hover:shadow-cosmic transition-all duration-300 hover:scale-105 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              ⚡ Pular
            </motion.button>
          )}
        </div>
      </div>

      {/* 3) CAMPO DE BATALHA COM CARTAS */}
      <section className="w-full">
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
        
        {/* Indicador de pensamento do oponente */}
        {logic.whoChooses === 'opponent' && !logic.battle.selectedAttribute && (
          <div className="flex justify-center mt-4">
            <ThinkingIndicator isVisible={true} />
          </div>
        )}
      </section>

      {/* 4) PROGRESSO E NÍVEL */}
      <section className="space-y-3">
        {/* Barra de progresso */}
        <BattleProgress
          playerCards={logic.battle.playerDeck.length}
          opponentCards={logic.battle.opponentDeck.length}
          initialPlayerCards={logic.initialPlayerCards}
          initialOpponentCards={logic.initialOpponentCards}
          round={logic.battle.round}
          playerScore={logic.battle.playerScore}
          opponentScore={logic.battle.opponentScore}
        />

        {/* Nível do jogador (lado direito) */}
        <div className="flex justify-end">
          <PlayerLevel {...effects.playerLevel} />
        </div>
      </section>

      {/* Efeitos visuais */}
      <AnimatePresence>
        {effects.showVictoryEffect && (
          <VictoryEffect isVisible={effects.showVictoryEffect} type={effects.victoryType} />
        )}
        
        {/* Conexão visual de atributos */}
        {state.showAttributeConnection && logic.battle.selectedAttribute && (
          <AttributeConnection
            selectedAttribute={logic.battle.selectedAttribute}
            playerValue={logic.battle.playerCard?.[logic.battle.selectedAttribute] || 0}
            opponentValue={logic.battle.opponentCard?.[logic.battle.selectedAttribute] || 0}
            isVisible={state.showAttributeConnection}
          />
        )}
      </AnimatePresence>

      {effects.showParticles && <ParticleEffect isActive={effects.showParticles} />}
    </motion.div>
  );
};

export default BattleArena;
