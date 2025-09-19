import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Crown, Sword } from 'lucide-react';

interface BattleProgressProps {
  playerCards: number;
  opponentCards: number;
  initialPlayerCards: number;
  initialOpponentCards: number;
  round: number;
  playerScore: number;
  opponentScore: number;
}

const BattleProgress = ({ 
  playerCards, 
  opponentCards, 
  initialPlayerCards, 
  initialOpponentCards,
  round, 
  playerScore, 
  opponentScore 
}: BattleProgressProps) => {
  const totalCards = initialPlayerCards + initialOpponentCards;
  const cardsPlayed = (initialPlayerCards - playerCards) + (initialOpponentCards - opponentCards);
  const progressPercentage = (cardsPlayed / totalCards) * 100;

  return (
    <motion.div 
      className="bg-card/30 backdrop-blur-sm rounded-lg p-4 mb-6"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        {/* Battle Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progresso da Batalha</span>
            <span className="text-sm font-medium">Rodada {round}</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{cardsPlayed} cartas jogadas</span>
            <span>{totalCards - cardsPlayed} restantes</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            animate={{ scale: playerScore > opponentScore ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 bg-cosmic-gold/20 rounded-full">
              <Crown className="w-4 h-4 text-cosmic-gold" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Suas Vitórias</div>
              <div className="text-lg font-bold text-cosmic-gold">{playerScore}</div>
            </div>
          </motion.div>

          <div className="text-center px-4">
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
          </div>

          <motion.div 
            className="flex items-center space-x-2"
            animate={{ scale: opponentScore > playerScore ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 bg-cosmic-purple/20 rounded-full">
              <Sword className="w-4 h-4 text-cosmic-purple" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Vitórias Oponente</div>
              <div className="text-lg font-bold text-cosmic-purple">{opponentScore}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BattleProgress;