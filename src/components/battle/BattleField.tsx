/**
 * Componente que representa o campo de batalha com as cartas
 */
import { motion, AnimatePresence } from 'framer-motion';
import BattleCard from '../BattleCard';
import type { ElementCard } from '@/hooks/battle/useBattleLogic';

interface BattleFieldProps {
  playerCard: ElementCard | null;
  opponentCard: ElementCard | null;
  isCardFlipped: boolean;
  isTransferring: boolean;
  transferDirection: 'left' | 'right';
  showPlayerAttributes?: boolean;
}

const BattleField = ({ 
  playerCard, 
  opponentCard, 
  isCardFlipped, 
  isTransferring,
  transferDirection,
  showPlayerAttributes = false
}: BattleFieldProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto">
      {/* Player Card */}
      <motion.div 
        className="flex justify-center"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {playerCard && (
          <BattleCard 
            card={playerCard} 
            showAttributes={showPlayerAttributes}
            isTransferring={isTransferring && transferDirection === 'left'}
            transferDirection="left"
          />
        )}
      </motion.div>

      {/* Opponent Card */}
      <motion.div 
        className="flex justify-center"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {opponentCard && (
            <BattleCard 
              card={opponentCard} 
              showAttributes={isCardFlipped}
              isOpponent={true}
              isFlipped={!isCardFlipped}
              isTransferring={isTransferring && transferDirection === 'right'}
              transferDirection="right"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BattleField;
