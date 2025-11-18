/**
 * Componente que exibe a tela de fim de jogo
 */
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  isVictory: boolean;
  playerScore: number;
  opponentScore: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const GameOverScreen = ({ 
  isVictory, 
  playerScore, 
  opponentScore, 
  onRestart, 
  onBackToMenu 
}: GameOverScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.6
        }}
      >
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                duration: 0.8,
                delay: 0.2
              }}
              className="flex justify-center mb-6"
            >
              <motion.div 
                className={`p-6 rounded-full ${isVictory ? 'bg-primary/20' : 'bg-destructive/20'}`}
                animate={isVictory ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {isVictory ? (
                  <Trophy className="w-16 h-16 text-primary" />
                ) : (
                  <Target className="w-16 h-16 text-destructive" />
                )}
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className={`text-4xl mb-2 ${isVictory ? 'text-primary' : 'text-destructive'}`}>
                {isVictory ? 'Vitória!' : 'Derrota'}
              </CardTitle>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CardDescription className="text-lg">
                {isVictory 
                  ? 'Parabéns! Você venceu a batalha e levou todas as cartas!' 
                  : 'O oponente ficou com todas as cartas desta vez.'}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div 
                className="text-center p-4 bg-card rounded-lg border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-sm text-muted-foreground mb-1">Suas Rodadas</div>
                <motion.div 
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  {playerScore}
                </motion.div>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-card rounded-lg border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-sm text-muted-foreground mb-1">Rodadas Oponente</div>
                <motion.div 
                  className="text-3xl font-bold text-secondary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                >
                  {opponentScore}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  onClick={onRestart} 
                  className="w-full"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  onClick={onBackToMenu} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Voltar ao Menu
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
