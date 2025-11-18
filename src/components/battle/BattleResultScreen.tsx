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
  const [timeLeft, setTimeLeft] = useState(5);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: -50 }}
        transition={{ 
          type: "spring",
          damping: 20,
          stiffness: 300
        }}
      >
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                duration: 0.8,
                delay: 0.1
              }}
              className="flex justify-center mb-4"
            >
              <motion.div 
                className={`p-4 rounded-full bg-card ${config.color}`}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(0,0,0,0)',
                    '0 0 20px rgba(255,215,0,0.3)',
                    '0 0 0px rgba(0,0,0,0)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className="w-12 h-12" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className={config.color}>{config.title}</CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardDescription>{config.description}</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={onNextRound} 
                className="w-full"
                size="lg"
              >
                Próxima Rodada ({timeLeft}s)
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BattleResultScreen;
