/**
 * Componente de contador regressivo visual
 * Mostra os segundos restantes antes da comparação
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface ComparisonTimerProps {
  duration: number; // em segundos
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

const ComparisonTimer = ({ duration, onComplete, onSkip, isActive }: ComparisonTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration);
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return newTime;
      });

      setProgress((prev) => {
        const newProgress = prev - (100 / (duration * 10));
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  const seconds = Math.ceil(timeLeft);
  const circumference = 2 * Math.PI * 45; // raio = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div 
        className="relative"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: seconds <= 3 ? [1, 1.05, 1] : 1
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {/* Círculo de fundo */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            fill="none"
            opacity="0.3"
          />
          {/* Círculo de progresso */}
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke="hsl(var(--cosmic-gold))"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
            animate={{
              filter: [
                'drop-shadow(0 0 5px hsl(var(--cosmic-gold)))',
                'drop-shadow(0 0 15px hsl(var(--cosmic-gold)))',
                'drop-shadow(0 0 5px hsl(var(--cosmic-gold)))'
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </svg>

        {/* Contador central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div
            key={seconds}
            initial={{ scale: 1.5, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`text-4xl font-bold ${seconds <= 3 ? 'text-destructive' : 'text-cosmic-gold'}`}
          >
            {seconds}
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Clock className="w-5 h-5 text-muted-foreground mx-auto mt-1" />
          </motion.div>
        </div>
      </motion.div>

      {/* Overlay escurecido com animação */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10 cursor-pointer" 
        onClick={onSkip}
      />
    </motion.div>
  );
};

export default ComparisonTimer;
