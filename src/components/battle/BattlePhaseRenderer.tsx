/**
 * Componente responsável por renderizar cada fase da batalha
 * 
 * Separa a renderização em componentes menores e mais focados:
 * - DeckBuilder: Fase de construção do baralho
 * - BattleArena: Fase de combate ativo
 * - BattleResultScreen: Fase de resultado da rodada
 * - GameOverScreen: Fase de fim de jogo
 * 
 * @example
 * ```tsx
 * <BattlePhaseRenderer
 *   phase="battle"
 *   battle={battle}
 * />
 * ```
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DeckBuilder from '../DeckBuilder';
import BattleArena from './BattleArena';
import BattleResultScreen from './BattleResultScreen';
import GameOverScreen from './GameOverScreen';
import TutorialModal from '../tutorial/TutorialModal';
import type { GamePhase } from '@/hooks/battle/useBattleState';
import type { useBattleOrchestrator } from '@/hooks/battle/useBattleOrchestrator';

interface BattlePhaseRendererProps {
  phase: GamePhase;
  battle: ReturnType<typeof useBattleOrchestrator>;
}

/**
 * Variantes de animação para transições suaves entre fases
 */
const phaseVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number] // ease-out curve
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as [number, number, number, number] // ease-in curve
    }
  }
};

/**
 * Renderiza a fase apropriada da batalha com animações suaves
 */
const BattlePhaseRenderer = ({ phase, battle }: BattlePhaseRendererProps) => {
  const { logic, state, effects, cards, actions } = battle;

  return (
    <>
      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={effects.showTutorial} 
        onClose={() => effects.toggleTutorial(false)} 
      />

      <AnimatePresence mode="wait">
        {/* Deck Builder Phase */}
        {phase === 'deckBuilder' && (
          <motion.div
            key="deckBuilder"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DeckBuilder 
              userCards={cards.userCards} 
              onStartBattle={actions.startBattle}
              onCancel={actions.restart}
            />
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => effects.toggleTutorial(true)}
              >
                Ver Tutorial
              </Button>
            </div>
          </motion.div>
        )}

        {/* Battle Phase */}
        {phase === 'battle' && (
          <motion.div
            key="battle"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BattleArena
              logic={logic}
              state={state}
              effects={effects}
              actions={actions}
              onSurrender={actions.surrender}
            />
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && logic.battle.battleResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <BattleResultScreen
              result={logic.battle.battleResult}
              onNextRound={actions.nextRound}
            />
          </motion.div>
        )}

        {/* Game Over Phase */}
        {phase === 'gameOver' && (
          <motion.div
            key="gameOver"
            variants={phaseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GameOverScreen
              isVictory={logic.battle.playerDeck.length > 0}
              playerScore={logic.battle.playerScore}
              opponentScore={logic.battle.opponentScore}
              onRestart={actions.restart}
              onBackToMenu={actions.restart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BattlePhaseRenderer;
