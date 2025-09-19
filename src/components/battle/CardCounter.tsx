import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Users, Bot } from 'lucide-react';

interface CardCounterProps {
  playerCards: number;
  opponentCards: number;
  playerName?: string;
}

const CardCounter = ({ playerCards, opponentCards, playerName = "Você" }: CardCounterProps) => {
  const maxCards = Math.max(playerCards, opponentCards);
  
  const getCardStackHeight = (count: number) => {
    return Math.min(count * 2, 40); // Max height of 40px
  };

  return (
    <div className="flex justify-between items-center mb-6">
      {/* Player Cards */}
      <motion.div 
        className="flex items-center space-x-3"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-cosmic-gold/20 rounded-full">
              <Users className="w-4 h-4 text-cosmic-gold" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{playerName}</div>
              <motion.div 
                className="text-xl font-bold text-cosmic-gold"
                key={playerCards}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {playerCards}
              </motion.div>
            </div>
          </div>
          
          {/* Visual Card Stack */}
          <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <div 
              className="relative"
              style={{ height: `${getCardStackHeight(playerCards)}px` }}
            >
              {Array.from({ length: Math.min(playerCards, 5) }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-12 bg-cosmic-gold/30 border border-cosmic-gold/50 rounded-sm"
                  style={{ 
                    top: `${i * 2}px`,
                    left: `${i * 1}px`,
                    zIndex: 5 - i
                  }}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    delay: i * 0.1,
                    duration: 0.3
                  }}
                />
              ))}
              {playerCards > 5 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-cosmic-gold font-bold">
                  +{playerCards - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Battle Status */}
      <div className="text-center">
        <div className="text-2xl font-bold text-muted-foreground mb-1">⚔️</div>
        <div className="text-sm text-muted-foreground">Batalha</div>
      </div>

      {/* Opponent Cards */}
      <motion.div 
        className="flex items-center space-x-3"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          {/* Visual Card Stack */}
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
            <div 
              className="relative"
              style={{ height: `${getCardStackHeight(opponentCards)}px` }}
            >
              {Array.from({ length: Math.min(opponentCards, 5) }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-12 bg-cosmic-purple/30 border border-cosmic-purple/50 rounded-sm"
                  style={{ 
                    top: `${i * 2}px`,
                    right: `${i * 1}px`,
                    zIndex: 5 - i
                  }}
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ 
                    delay: i * 0.1 + 0.2,
                    duration: 0.3
                  }}
                />
              ))}
              {opponentCards > 5 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-cosmic-purple font-bold">
                  +{opponentCards - 5}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div>
              <div className="text-sm text-muted-foreground">Oponente</div>
              <motion.div 
                className="text-xl font-bold text-cosmic-purple"
                key={opponentCards}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {opponentCards}
              </motion.div>
            </div>
            <div className="p-2 bg-cosmic-purple/20 rounded-full">
              <Bot className="w-4 h-4 text-cosmic-purple" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardCounter;