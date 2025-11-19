/**
 * Barra superior compacta da batalha
 * Contém: Controles, Round, Timer (quando ativo)
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  round: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSurrender: () => void;
  timerActive?: boolean;
  timeRemaining?: number;
  onSkipTimer?: () => void;
}

const TopBar = ({
  round,
  isPaused,
  onPause,
  onResume,
  onSurrender,
  timerActive = false,
  timeRemaining = 0,
  onSkipTimer
}: TopBarProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full h-14 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 flex items-center justify-between gap-4"
    >
      {/* Controles Esquerda */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={isPaused ? onResume : onPause}
          className="h-9"
        >
          {isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSurrender}
          className="h-9 text-destructive hover:text-destructive"
        >
          <Flag className="w-4 h-4 mr-1" />
          Desistir
        </Button>
      </div>

      {/* Round Central */}
      <motion.div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <span className="text-sm font-semibold text-primary">
          Rodada {round}
        </span>
      </motion.div>

      {/* Timer Direita */}
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        <AnimatePresence>
          {timerActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2"
            >
              {/* Timer circular */}
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    className="fill-none stroke-muted"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    className={`fill-none ${
                      timeRemaining <= 3 ? 'stroke-destructive' : 'stroke-primary'
                    }`}
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{
                      strokeDashoffset: (2 * Math.PI * 16) * (1 - timeRemaining / 5)
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </svg>
                <motion.div
                  className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                    timeRemaining <= 3 ? 'text-destructive' : 'text-primary'
                  }`}
                  animate={
                    timeRemaining <= 3
                      ? { scale: [1, 1.2, 1] }
                      : {}
                  }
                  transition={{ duration: 0.5, repeat: timeRemaining <= 3 ? Infinity : 0 }}
                >
                  {Math.ceil(timeRemaining)}
                </motion.div>
              </div>

              {/* Botão Skip */}
              {onSkipTimer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkipTimer}
                  className="h-9 text-xs"
                >
                  Pular ⚡
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TopBar;
