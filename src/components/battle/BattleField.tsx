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
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {playerCard && (
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
        )}
      </motion.div>

      {/* Opponent Card */}
      <motion.div 
        className="flex justify-center items-center"
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
              selectedAttribute={selectedAttribute}
              showOwnerLabel={true}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BattleField;
