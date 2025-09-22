import { motion } from 'framer-motion';
import { Trophy, Target, Sword, Crown, Star, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  achievements: Achievement[];
  onClaimReward?: (achievementId: string) => void;
}

const achievementsList: Achievement[] = [
  {
    id: 'first-win',
    title: 'Primeira Vitória',
    description: 'Ganhe sua primeira batalha',
    icon: Trophy,
    progress: 0,
    maxProgress: 1,
    isCompleted: false,
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'win-streak',
    title: 'Sequência Imparável',
    description: 'Ganhe 5 batalhas seguidas',
    icon: Target,
    progress: 0,
    maxProgress: 5,
    isCompleted: false,
    xpReward: 500,
    rarity: 'rare'
  },
  {
    id: 'battle-veteran',
    title: 'Veterano de Batalha',
    description: 'Complete 50 batalhas',
    icon: Sword,
    progress: 0,
    maxProgress: 50,
    isCompleted: false,
    xpReward: 1000,
    rarity: 'epic'
  },
  {
    id: 'grand-champion',
    title: 'Grande Campeão',
    description: 'Alcance o nível 25',
    icon: Crown,
    progress: 0,
    maxProgress: 25,
    isCompleted: false,
    xpReward: 2500,
    rarity: 'legendary'
  },
  {
    id: 'deck-master',
    title: 'Mestre dos Baralhos',
    description: 'Crie 10 baralhos diferentes',
    icon: Star,
    progress: 0,
    maxProgress: 10,
    isCompleted: false,
    xpReward: 300,
    rarity: 'rare'
  }
];

const AchievementSystem = ({ 
  achievements = achievementsList, 
  onClaimReward 
}: AchievementSystemProps) => {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground border-muted';
      case 'rare': return 'text-cosmic-blue border-cosmic-blue/50';
      case 'epic': return 'text-cosmic-purple border-cosmic-purple/50';
      case 'legendary': return 'text-cosmic-gold border-cosmic-gold/50';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-muted/10';
      case 'rare': return 'bg-cosmic-blue/10';
      case 'epic': return 'bg-cosmic-purple/10';
      case 'legendary': return 'bg-cosmic-gold/10';
      default: return 'bg-muted/10';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cosmic-gold mb-4">Conquistas</h2>
      
      <div className="grid gap-4">
        {achievements.map((achievement, index) => {
          const IconComponent = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`${getRarityBg(achievement.rarity)} border ${getRarityColor(achievement.rarity).split(' ')[1]} hover-lift`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <motion.div 
                        className={`p-3 rounded-full ${getRarityBg(achievement.rarity)} border ${getRarityColor(achievement.rarity).split(' ')[1]}`}
                        whileHover={{ scale: 1.1 }}
                        animate={achievement.isCompleted ? { 
                          boxShadow: ["0 0 0 0 rgba(255,215,0,0.7)", "0 0 0 10px rgba(255,215,0,0)", "0 0 0 0 rgba(255,215,0,0)"]
                        } : {}}
                        transition={{ duration: 2, repeat: achievement.isCompleted ? Infinity : 0 }}
                      >
                        {achievement.isCompleted ? (
                          <CheckCircle className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
                        ) : (
                          <IconComponent className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-bold ${getRarityColor(achievement.rarity)}`}>
                            {achievement.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`${getRarityColor(achievement.rarity)} ${getRarityBg(achievement.rarity)}`}
                          >
                            +{achievement.xpReward} XP
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span>{achievement.progress} / {achievement.maxProgress}</span>
                          </div>
                          
                          <Progress 
                            value={progressPercentage} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {achievement.isCompleted && onClaimReward && (
                      <motion.button
                        className="ml-3 px-3 py-1 bg-cosmic-gold text-cosmic-dark rounded-md text-sm font-medium hover:bg-cosmic-gold-light transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onClaimReward(achievement.id)}
                      >
                        Resgatar
                      </motion.button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementSystem;