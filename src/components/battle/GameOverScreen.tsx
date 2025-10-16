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
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <div className={`p-6 rounded-full ${isVictory ? 'bg-primary/20' : 'bg-destructive/20'}`}>
              {isVictory ? (
                <Trophy className="w-16 h-16 text-primary" />
              ) : (
                <Target className="w-16 h-16 text-destructive" />
              )}
            </div>
          </motion.div>
          
          <CardTitle className={`text-4xl mb-2 ${isVictory ? 'text-primary' : 'text-destructive'}`}>
            {isVictory ? 'Vitória!' : 'Derrota'}
          </CardTitle>
          
          <CardDescription className="text-lg">
            {isVictory 
              ? 'Parabéns! Você venceu a batalha e levou todas as cartas!' 
              : 'O oponente ficou com todas as cartas desta vez.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Suas Rodadas</div>
              <div className="text-3xl font-bold text-primary">{playerScore}</div>
            </div>
            <div className="text-center p-4 bg-card rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Rodadas Oponente</div>
              <div className="text-3xl font-bold text-secondary">{opponentScore}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onRestart} 
              className="flex-1"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button 
              onClick={onBackToMenu} 
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Voltar ao Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GameOverScreen;
