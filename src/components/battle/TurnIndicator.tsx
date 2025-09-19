import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TurnIndicatorProps {
  whoChooses: 'player' | 'opponent';
  isActive: boolean;
  onTimeOut?: () => void;
  timeLimit?: number; // seconds
}

const TurnIndicator = ({ whoChooses, isActive, onTimeOut, timeLimit = 15 }: TurnIndicatorProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(timeLimit);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeOut?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLimit, onTimeOut]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [whoChooses, timeLimit]);

  const progressPercentage = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <motion.div 
      className="flex items-center justify-center space-x-4 mb-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`
          p-3 rounded-full transition-all duration-300
          ${whoChooses === 'player' 
            ? 'bg-cosmic-gold/20 border-2 border-cosmic-gold' 
            : 'bg-cosmic-purple/20 border-2 border-cosmic-purple'
          }
        `}>
          {whoChooses === 'player' ? (
            <User className="w-5 h-5 text-cosmic-gold" />
          ) : (
            <Bot className="w-5 h-5 text-cosmic-purple" />
          )}
        </div>

        <div className="text-center">
          <div className={`
            text-lg font-bold transition-colors
            ${whoChooses === 'player' ? 'text-cosmic-gold' : 'text-cosmic-purple'}
          `}>
            {whoChooses === 'player' ? 'Sua Vez' : 'Vez do Oponente'}
          </div>
          
          {isActive && whoChooses === 'player' && (
            <motion.div 
              className="flex items-center space-x-2"
              animate={{ scale: isUrgent ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: isUrgent ? Infinity : 0, duration: 0.5 }}
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${isUrgent ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                {timeLeft}s
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {isActive && whoChooses === 'player' && (
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full transition-colors ${
              isUrgent ? 'bg-red-500' : 'bg-cosmic-gold'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default TurnIndicator;