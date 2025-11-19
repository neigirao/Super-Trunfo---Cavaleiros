/**
 * Indicador de turno aprimorado
 * Visual mais proeminente e animações chamativas
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Brain } from 'lucide-react';

interface EnhancedTurnIndicatorProps {
  whoChooses: 'player' | 'opponent';
  isActive: boolean;
}

const EnhancedTurnIndicator = ({ whoChooses, isActive }: EnhancedTurnIndicatorProps) => {
  const isPlayerTurn = whoChooses === 'player';

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={whoChooses}
          initial={{ scale: 0, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <motion.div
            className={`
              relative px-8 py-4 rounded-2xl border-2 backdrop-blur-md
              ${isPlayerTurn 
                ? 'bg-primary/20 border-primary shadow-lg shadow-primary/50' 
                : 'bg-muted/20 border-muted shadow-lg shadow-muted/50'
              }
            `}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: isPlayerTurn
                ? [
                    '0 10px 40px -10px rgba(var(--primary), 0.5)',
                    '0 15px 50px -10px rgba(var(--primary), 0.7)',
                    '0 10px 40px -10px rgba(var(--primary), 0.5)'
                  ]
                : undefined
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 rounded-2xl ${
                isPlayerTurn ? 'bg-primary/20' : 'bg-muted/20'
              }`}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Conteúdo */}
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isPlayerTurn ? (
                  <Swords className="w-6 h-6 text-primary" />
                ) : (
                  <Brain className="w-6 h-6 text-muted-foreground" />
                )}
              </motion.div>

              <div className="flex flex-col">
                <motion.span
                  className={`text-lg font-bold ${
                    isPlayerTurn ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  animate={isPlayerTurn ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {isPlayerTurn ? '➤ Sua Vez!' : 'Oponente Pensando...'}
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  {isPlayerTurn ? 'Escolha um atributo' : 'Aguarde...'}
                </span>
              </div>
            </div>

            {/* Partículas decorativas (apenas no turno do jogador) */}
            {isPlayerTurn && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i - 1) * 30],
                      y: [0, -30]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedTurnIndicator;
