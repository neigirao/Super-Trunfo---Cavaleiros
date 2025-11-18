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
  canSelectAttribute?: boolean;
  onAttributeSelect?: (attribute: any) => void;
  selectedAttribute?: any;
}

const BattleField = ({ 
  playerCard, 
  opponentCard, 
  isCardFlipped, 
  isTransferring,
  transferDirection,
  showPlayerAttributes = false,
  canSelectAttribute = false,
  onAttributeSelect,
  selectedAttribute
}: BattleFieldProps) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
      {/* Player Card */}
      <motion.div 
        className="flex justify-center items-center"
        initial={{ x: -100, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <AnimatePresence mode="wait">
          {playerCard && (
            <motion.div
              key={playerCard.id}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <BattleCard 
                card={playerCard} 
                showAttributes={showPlayerAttributes}
                canSelectAttribute={canSelectAttribute}
                onAttributeSelect={onAttributeSelect}
                selectedAttribute={selectedAttribute}
                isTransferring={isTransferring && transferDirection === 'left'}
                transferDirection="left"
                showOwnerLabel={true}
                isOpponent={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Opponent Card */}
      <motion.div 
        className="flex justify-center items-center"
        initial={{ x: 100, opacity: 0, scale: 0.9 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <AnimatePresence mode="wait">
          {opponentCard && (
            <motion.div
              key={opponentCard.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <BattleCard 
                card={opponentCard} 
                showAttributes={isCardFlipped}
                isOpponent={true}
                isFlipped={!isCardFlipped}
                isTransferring={isTransferring && transferDirection === 'right'}
                transferDirection="right"
                selectedAttribute={selectedAttribute}
                showOwnerLabel={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BattleField;
