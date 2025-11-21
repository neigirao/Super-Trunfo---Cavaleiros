/**
 * Barra superior compacta da batalha - Fase 3 & 4
 * Mobile-first com animações aprimoradas
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Flag, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 100
      }}
      className="w-full bg-background/95 backdrop-blur-md border-b border-border px-3 md:px-6 py-2 md:py-3 flex items-center justify-between gap-2 md:gap-4 h-12 md:h-14 z-50 shadow-md"
    >
      {/* Round Indicator */}
      <motion.div 
        className="flex items-center gap-2 min-w-[100px] md:min-w-[120px]"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Badge variant="outline" className="bg-primary/10 border-primary/30 px-2 md:px-3 py-1 text-xs md:text-sm">
          <Trophy className="w-3 h-3 md:w-4 md:h-4 mr-1 text-primary" />
          <span className="font-bold">Round {round}</span>
        </Badge>
      </motion.div>

      {/* Timer (quando ativo) */}
      <AnimatePresence>
        {timerActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="flex items-center gap-1.5 md:gap-2 bg-muted/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-border"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </motion.div>
            <motion.span 
              className="text-xs md:text-sm font-bold min-w-[32px] text-center"
              animate={{ 
                scale: timeRemaining < 2 ? [1, 1.1, 1] : 1,
                color: timeRemaining < 2 ? ["hsl(var(--foreground))", "hsl(var(--destructive))", "hsl(var(--foreground))"] : "hsl(var(--foreground))"
              }}
              transition={{ duration: 0.5, repeat: timeRemaining < 2 ? Infinity : 0 }}
            >
              {timeRemaining.toFixed(1)}s
            </motion.span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onSkipTimer}
              className="h-5 md:h-6 px-1.5 md:px-2 text-xs hover:bg-primary/20 transition-colors"
            >
              Pular
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={isPaused ? onResume : onPause}
            className="gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm min-w-[44px]"
          >
            {isPaused ? <Play className="w-3 h-3 md:w-4 md:h-4" /> : <Pause className="w-3 h-3 md:w-4 md:h-4" />}
            <span className="hidden sm:inline">{isPaused ? 'Retomar' : 'Pausar'}</span>
          </Button>
        </motion.div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" variant="destructive" className="gap-1.5 md:gap-2 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm min-w-[44px]">
                <Flag className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Desistir</span>
              </Button>
            </motion.div>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] md:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Desistir da batalha?</AlertDialogTitle>
              <AlertDialogDescription>
                Você perderá esta partida e voltará ao menu principal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onSurrender} className="w-full sm:w-auto">
                Desistir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default TopBar;
