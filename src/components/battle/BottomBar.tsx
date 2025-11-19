/**
 * Barra inferior compacta da batalha
 * Contém: Progresso unificado (cartas + XP)
 */
import { motion } from 'framer-motion';
import { Users, Bot } from 'lucide-react';

interface BottomBarProps {
  playerCards: number;
  opponentCards: number;
  initialPlayerCards: number;
  initialOpponentCards: number;
  playerLevel: number;
  currentXP: number;
  xpToNextLevel: number;
}

const BottomBar = ({
  playerCards,
  opponentCards,
  initialPlayerCards,
  initialOpponentCards,
  playerLevel,
  currentXP,
  xpToNextLevel
}: BottomBarProps) => {
  // Calcular progresso das cartas
  const playerProgress = (playerCards / initialPlayerCards) * 100;
  const opponentProgress = (opponentCards / initialOpponentCards) * 100;
  const xpProgress = (currentXP / xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-background/80 backdrop-blur-sm border-t border-border/50 px-6 py-3 space-y-2"
    >
      {/* Barra de Progresso de Cartas */}
      <div className="flex items-center gap-3">
        {/* Jogador */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {playerCards}
          </span>
        </div>

        {/* Barra Visual */}
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
          {/* Progress do Jogador (esquerda) */}
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${playerProgress}%` }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Progress do Oponente (direita) */}
          <motion.div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-destructive to-destructive/80"
            initial={{ width: 0 }}
            animate={{ width: `${opponentProgress}%` }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Linha Divisória Central */}
          <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />
        </div>

        {/* Oponente */}
        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          <span className="text-sm font-semibold text-foreground">
            {opponentCards}
          </span>
          <Bot className="w-4 h-4 text-destructive" />
        </div>
      </div>

      {/* Barra de XP */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="text-xs font-medium text-muted-foreground">
            Nível {playerLevel}
          </span>
        </div>

        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          <span className="text-xs font-medium text-muted-foreground">
            {currentXP}/{xpToNextLevel} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BottomBar;
