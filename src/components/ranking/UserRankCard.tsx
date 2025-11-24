import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserRankCardProps {
  position: number;
  totalScore: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  currentStreak: number;
}

const UserRankCard = ({ 
  position, 
  totalScore, 
  gamesWon, 
  gamesLost,
  winRate,
  currentStreak
}: UserRankCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-cosmic-gold/20 to-cosmic-gold/5 border-cosmic-gold/50 mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Position */}
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-cosmic-gold" />
              <div className="text-3xl font-bold text-cosmic-gold">#{position}</div>
              <div className="text-sm text-muted-foreground">Posição</div>
            </div>

            {/* Score */}
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-cosmic-blue" />
              <div className="text-3xl font-bold text-foreground">{totalScore.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pontuação</div>
            </div>

            {/* Win Rate */}
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-cosmic-purple" />
              <div className="text-3xl font-bold text-foreground">{winRate}%</div>
              <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
              <Progress value={winRate} className="h-2 mt-2" />
            </div>

            {/* Streak */}
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Sequência Atual</div>
            </div>
          </div>

          {/* Games Summary */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="text-muted-foreground">
                <span className="text-cosmic-green font-semibold">{gamesWon}</span> vitórias
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="text-muted-foreground">
                <span className="text-red-500 font-semibold">{gamesLost}</span> derrotas
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="text-muted-foreground">
                <span className="font-semibold">{gamesWon + gamesLost}</span> jogos totais
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserRankCard;
