/**
 * Componente que exibe o resultado de uma rodada
 */
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sword, Equal } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BattleResultScreenProps {
  result: 'win' | 'lose' | 'draw';
  onNextRound: () => void;
}

const BattleResultScreen = ({ result, onNextRound }: BattleResultScreenProps) => {
  const [timeLeft, setTimeLeft] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNextRound]);

  const resultConfig = {
    win: {
      title: 'Você Venceu!',
      description: 'Você ganhou esta rodada e levou as cartas!',
      icon: Crown,
      color: 'text-primary'
    },
    lose: {
      title: 'Você Perdeu!',
      description: 'O oponente ganhou esta rodada.',
      icon: Sword,
      color: 'text-destructive'
    },
    draw: {
      title: 'Empate!',
      description: 'As cartas vão para a pilha de descarte.',
      icon: Equal,
      color: 'text-muted-foreground'
    }
  };

  const config = resultConfig[result];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className={`p-4 rounded-full bg-card ${config.color}`}>
              <Icon className="w-12 h-12" />
            </div>
          </motion.div>
          <CardTitle className={config.color}>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onNextRound} 
            className="w-full"
            size="lg"
          >
            Próxima Rodada ({timeLeft}s)
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BattleResultScreen;
