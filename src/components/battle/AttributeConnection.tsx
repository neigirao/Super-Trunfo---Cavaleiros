/**
 * Componente de conexão visual entre atributos comparados
 * FASE 2: Visual aprimorado com linha mais grossa, animação de pulso e diferença numérica
 */
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BattleAttribute } from '@/hooks/battle/useBattleLogic';

interface AttributeConnectionProps {
  selectedAttribute: BattleAttribute | null;
  playerValue: number;
  opponentValue: number;
  isVisible: boolean;
}

const AttributeConnection = ({ 
  selectedAttribute, 
  playerValue, 
  opponentValue,
  isVisible 
}: AttributeConnectionProps) => {
  if (!selectedAttribute) return null;

  const playerWins = playerValue > opponentValue;
  const isDraw = playerValue === opponentValue;
  const difference = Math.abs(playerValue - opponentValue);


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-10 pointer-events-none"
        >
          {/* Linha conectando as cartas - mais grossa e vibrante */}
          <svg 
            className="w-full h-32" 
            viewBox="0 0 800 120"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Gradiente para a linha */}
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={playerWins ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                <stop offset="50%" stopColor="hsl(var(--cosmic-gold))" />
                <stop offset="100%" stopColor={playerWins ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
              </linearGradient>
            </defs>
            
            {/* Linha principal - mais grossa */}
            <motion.line
              x1="80"
              y1="60"
              x2="720"
              y2="60"
              stroke="url(#lineGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                pathLength: { duration: 0.8, ease: "easeInOut" },
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            {/* Círculo central maior */}
            <motion.circle
              cx="400"
              cy="60"
              r="50"
              fill="hsl(var(--background))"
              stroke={isDraw ? "hsl(var(--muted))" : playerWins ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="4"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                strokeWidth: [4, 6, 4]
              }}
              transition={{ 
                scale: { delay: 0.3, type: "spring", stiffness: 200, damping: 15 },
                strokeWidth: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Círculo de glow externo */}
            <motion.circle
              cx="400"
              cy="60"
              r="50"
              fill="none"
              stroke={isDraw ? "hsl(var(--muted))" : playerWins ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="2"
              opacity="0.3"
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </svg>
          
          {/* Badge com informação de comparação */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className={`
              px-6 py-3 rounded-2xl backdrop-blur-md border-2
              ${isDraw 
                ? 'bg-muted/20 border-muted' 
                : playerWins 
                  ? 'bg-primary/20 border-primary' 
                  : 'bg-destructive/20 border-destructive'
              }
            `}>
              {/* Nome do atributo */}
              <div className={`text-xs font-medium text-center mb-1 ${
                isDraw ? 'text-muted-foreground' : playerWins ? 'text-primary' : 'text-destructive'
              }`}>
                {selectedAttribute.replace('_', ' ').toUpperCase()}
              </div>
              
              {/* Diferença de valores */}
              <div className="flex items-center justify-center gap-2">
                {isDraw ? (
                  <>
                    <Minus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-lg font-bold text-muted-foreground">
                      Empate
                    </span>
                  </>
                ) : (
                  <>
                    {playerWins ? (
                      <TrendingUp className="w-5 h-5 text-primary" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`text-lg font-bold ${
                      playerWins ? 'text-primary' : 'text-destructive'
                    }`}>
                      +{difference.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttributeConnection;
