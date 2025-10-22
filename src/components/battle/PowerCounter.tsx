/**
 * Contador de poder estilo Marvel Snap
 * Mostra o poder total de cada jogador de forma destacada
 */
import { motion } from 'framer-motion';
import { Crown, Skull } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PowerCounterProps {
  playerPower: number;
  opponentPower: number;
  previousPlayerPower?: number;
  previousOpponentPower?: number;
}

const PowerCounter = ({ 
  playerPower, 
  opponentPower,
  previousPlayerPower = 0,
  previousOpponentPower = 0
}: PowerCounterProps) => {
  const [showPlayerIncrease, setShowPlayerIncrease] = useState(false);
  const [showOpponentIncrease, setShowOpponentIncrease] = useState(false);

  useEffect(() => {
    if (playerPower > previousPlayerPower) {
      setShowPlayerIncrease(true);
      setTimeout(() => setShowPlayerIncrease(false), 400);
    }
  }, [playerPower, previousPlayerPower]);

  useEffect(() => {
    if (opponentPower > previousOpponentPower) {
      setShowOpponentIncrease(true);
      setTimeout(() => setShowOpponentIncrease(false), 400);
    }
  }, [opponentPower, previousOpponentPower]);

  const isPlayerWinning = playerPower > opponentPower;
  const isOpponentWinning = opponentPower > playerPower;
  const isTied = playerPower === opponentPower;

  return (
    <div className="flex items-center justify-center gap-8 mb-6">
      {/* Player Power */}
      <motion.div
        className={`
          relative flex items-center gap-3 px-6 py-4 rounded-2xl
          backdrop-blur-md border-2 transition-all duration-300
          ${isPlayerWinning 
            ? 'bg-cosmic-gold/20 border-cosmic-gold shadow-[var(--glow-win)]' 
            : isTied 
            ? 'bg-card/60 border-cosmic-gold/40'
            : 'bg-card/40 border-border opacity-80'
          }
        `}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Crown className={`w-6 h-6 ${isPlayerWinning ? 'text-cosmic-gold' : 'text-muted-foreground'}`} />
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground font-medium mb-1">Você</span>
          <motion.span
            className={`
              text-4xl font-bold tabular-nums
              ${isPlayerWinning ? 'text-cosmic-gold power-pulse' : 'text-foreground'}
              ${showPlayerIncrease ? 'power-increase' : ''}
            `}
            key={playerPower}
          >
            {playerPower}
          </motion.span>
        </div>
      </motion.div>

      {/* VS Divider */}
      <div className="text-2xl font-bold text-muted-foreground opacity-50">VS</div>

      {/* Opponent Power */}
      <motion.div
        className={`
          relative flex items-center gap-3 px-6 py-4 rounded-2xl
          backdrop-blur-md border-2 transition-all duration-300
          ${isOpponentWinning 
            ? 'bg-cosmic-purple/20 border-cosmic-purple shadow-[var(--glow-lose)]' 
            : isTied 
            ? 'bg-card/60 border-cosmic-purple/40'
            : 'bg-card/40 border-border opacity-80'
          }
        `}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground font-medium mb-1">Oponente</span>
          <motion.span
            className={`
              text-4xl font-bold tabular-nums
              ${isOpponentWinning ? 'text-cosmic-purple-light power-pulse' : 'text-foreground'}
              ${showOpponentIncrease ? 'power-increase' : ''}
            `}
            key={opponentPower}
          >
            {opponentPower}
          </motion.span>
        </div>
        <Skull className={`w-6 h-6 ${isOpponentWinning ? 'text-cosmic-purple-light' : 'text-muted-foreground'}`} />
      </motion.div>
    </div>
  );
};

export default PowerCounter;
