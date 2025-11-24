import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Target } from 'lucide-react';

interface CollectionStatsProps {
  ownedCards: number;
  totalCards: number;
  rarityBreakdown: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

const CollectionStats = ({ ownedCards, totalCards, rarityBreakdown }: CollectionStatsProps) => {
  const completionRate = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;
  
  const getRarityPercentage = (count: number) => {
    return ownedCards > 0 ? Math.round((count / ownedCards) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Collection */}
      <Card className="bg-gradient-to-br from-cosmic-gold/20 to-cosmic-gold/5 border-cosmic-gold/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-cosmic-gold" />
            <span className="text-3xl font-bold text-cosmic-gold">{ownedCards}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-3">Cavaleiros Coletados</div>
          <Progress value={completionRate} className="h-2" />
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {completionRate}% da coleção completa
          </div>
        </CardContent>
      </Card>

      {/* Common Cards */}
      <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-cosmic-green" />
            <span className="text-2xl font-bold text-cosmic-green">{rarityBreakdown.common}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">Comuns</div>
          <div className="text-xs text-muted-foreground">
            {getRarityPercentage(rarityBreakdown.common)}% da coleção
          </div>
        </CardContent>
      </Card>

      {/* Rare Cards */}
      <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6 text-cosmic-blue" />
            <span className="text-2xl font-bold text-cosmic-blue">{rarityBreakdown.rare + rarityBreakdown.epic}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">Raros/Épicos</div>
          <div className="text-xs text-muted-foreground">
            {getRarityPercentage(rarityBreakdown.rare + rarityBreakdown.epic)}% da coleção
          </div>
        </CardContent>
      </Card>

      {/* Legendary Cards */}
      <Card className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-purple/5 border-cosmic-purple/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-6 h-6 text-cosmic-purple" />
            <span className="text-2xl font-bold text-cosmic-purple">{rarityBreakdown.legendary}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">Lendários</div>
          <div className="text-xs text-muted-foreground">
            {getRarityPercentage(rarityBreakdown.legendary)}% da coleção
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionStats;
