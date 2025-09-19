import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface BattleControlsProps {
  onSurrender: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  canSurrender?: boolean;
  canPause?: boolean;
}

const BattleControls = ({ 
  onSurrender, 
  onPause, 
  onResume, 
  isPaused = false, 
  canSurrender = true,
  canPause = true 
}: BattleControlsProps) => {
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);

  const handleSurrender = () => {
    setShowSurrenderDialog(false);
    onSurrender();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      onResume?.();
    } else {
      onPause?.();
    }
  };

  return (
    <>
      <motion.div 
        className="fixed top-4 right-4 flex space-x-2 z-50"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Pause/Resume Button */}
        {canPause && (onPause || onResume) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseResume}
            className="bg-card/80 backdrop-blur-sm border-cosmic-blue/30 hover:border-cosmic-blue"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-1" />
                Continuar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </>
            )}
          </Button>
        )}

        {/* Surrender Button */}
        {canSurrender && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSurrenderDialog(true)}
            className="bg-card/80 backdrop-blur-sm border-red-500/30 hover:border-red-500 text-red-500 hover:text-red-600"
          >
            <Flag className="w-4 h-4 mr-1" />
            Desistir
          </Button>
        )}
      </motion.div>

      {/* Surrender Confirmation Dialog */}
      <Dialog open={showSurrenderDialog} onOpenChange={setShowSurrenderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-red-500" />
              <span>Desistir da Batalha?</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Tem certeza que deseja desistir desta batalha? 
              Esta ação não pode ser desfeita e você perderá automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSurrenderDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSurrender}
              className="flex-1"
            >
              <Flag className="w-4 h-4 mr-1" />
              Desistir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Overlay */}
      {isPaused && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-6xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-cosmic-gold">Batalha Pausada</h2>
            <p className="text-muted-foreground">A batalha foi pausada. Clique em "Continuar" para retomar.</p>
            
            <Button
              onClick={onResume}
              className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
            >
              <Play className="w-4 h-4 mr-2" />
              Continuar Batalha
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BattleControls;