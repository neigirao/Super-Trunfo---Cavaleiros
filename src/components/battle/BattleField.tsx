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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center justify-items-center px-4 md:px-0">
      {/* Player Card */}
      <motion.div 
        className="flex justify-center items-center w-full"
        initial={{ x: -200, opacity: 0, scale: 0.8, rotateY: -20 }}
        animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ 
          duration: 0.7,
          type: "spring",
          stiffness: 120,
          damping: 20,
          delay: 0.1
        }}
      >
        <AnimatePresence mode="wait">
          {playerCard && (
            <motion.div
              key={playerCard.id}
              initial={{ rotateY: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ 
                rotateY: 180, 
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.4 }
              }}
              whileHover={{ 
                scale: 1.03,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
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
        className="flex justify-center items-center w-full"
        initial={{ x: 200, opacity: 0, scale: 0.8, rotateY: 20 }}
        animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ 
          duration: 0.7,
          type: "spring",
          stiffness: 120,
          damping: 20,
          delay: 0.2
        }}
      >
        <AnimatePresence mode="wait">
          {opponentCard && (
            <motion.div
              key={opponentCard.id}
              initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ 
                rotateY: -180, 
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              transition={{ 
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.4 }
              }}
              whileHover={{ 
                scale: 1.03,
                rotateY: -5,
                transition: { duration: 0.3 }
              }}
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
