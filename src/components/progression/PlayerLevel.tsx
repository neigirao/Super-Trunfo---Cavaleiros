import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PlayerLevelProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalExperience: number;
}

const PlayerLevel = ({ 
  level, 
  experience, 
  experienceToNextLevel, 
  totalExperience 
}: PlayerLevelProps) => {
  const progressPercentage = (experience / experienceToNextLevel) * 100;

  const getLevelIcon = (level: number) => {
    if (level >= 20) return Trophy;
    if (level >= 10) return Star;
    return Zap;
  };

  const LevelIcon = getLevelIcon(level);

  return (
    <motion.div 
      className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-cosmic-gold/20"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="p-2 bg-cosmic-gold/20 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <LevelIcon className="w-5 h-5 text-cosmic-gold" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-cosmic-gold">Nível {level}</h3>
            <p className="text-sm text-muted-foreground">Cavaleiro dos Elementos</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-cosmic-gold/10 text-cosmic-gold border-cosmic-gold/30">
          {totalExperience} XP Total
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso para o próximo nível</span>
          <span className="font-medium">{experience} / {experienceToNextLevel} XP</span>
        </div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        >
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-cosmic-nebula/50"
          />
        </motion.div>
        
        <div className="text-xs text-muted-foreground text-center">
          Faltam {experienceToNextLevel - experience} XP para o nível {level + 1}
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerLevel;