/**
 * Barra inferior compacta da batalha - Fase 3 & 4
 * Mobile-first com animações aprimoradas
 */
import { motion } from 'framer-motion';
import { User, Swords, Star } from 'lucide-react';

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
  const playerProgress = (playerCards / initialPlayerCards) * 100;
  const opponentProgress = (opponentCards / initialOpponentCards) * 100;
  const xpProgress = (currentXP / xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 100
      }}
      className="w-full bg-background/95 backdrop-blur-md border-t border-border px-3 md:px-6 py-2 md:py-3 space-y-1.5 md:space-y-2 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]"
    >
      {/* Card Progress */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
        {/* Player Cards */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-[60px] md:min-w-[80px]">
            <User className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium">Você</span>
          </div>
          <div className="flex-1 relative h-2 md:h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: `${playerProgress}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <motion.span 
            className="text-xs md:text-sm font-bold min-w-[40px] md:min-w-[50px] text-right tabular-nums"
            key={playerCards}
            initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            transition={{ duration: 0.3 }}
          >
            {playerCards}/{initialPlayerCards}
          </motion.span>
        </div>

        {/* Opponent Cards */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-[80px] md:min-w-[100px]">
            <Swords className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
            <span className="text-xs md:text-sm font-medium">Oponente</span>
          </div>
          <div className="flex-1 relative h-2 md:h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-destructive to-destructive/80 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: `${opponentProgress}%` }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <motion.span 
            className="text-xs md:text-sm font-bold min-w-[40px] md:min-w-[50px] text-right tabular-nums"
            key={opponentCards}
            initial={{ scale: 1.2, color: "hsl(var(--destructive))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            transition={{ duration: 0.3 }}
          >
            {opponentCards}/{initialOpponentCards}
          </motion.span>
        </div>
      </div>

      {/* XP Progress */}
      <motion.div 
        className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-muted/30 rounded-lg"
        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.4)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-1.5 min-w-[50px] md:min-w-[60px]">
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Star className="w-3 h-3 md:w-4 md:h-4 text-cosmic-gold" />
          </motion.div>
          <span className="text-xs md:text-sm font-medium">Nv. {playerLevel}</span>
        </div>
        <div className="flex-1 relative h-2 md:h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <motion.span 
          className="text-xs md:text-sm font-bold min-w-[60px] md:min-w-[70px] text-right text-cosmic-gold tabular-nums"
          key={currentXP}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentXP}/{xpToNextLevel} XP
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default BottomBar;
