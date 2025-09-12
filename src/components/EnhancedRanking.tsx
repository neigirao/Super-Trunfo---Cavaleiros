import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Medal, Crown, Star, Flame, Zap } from 'lucide-react';

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  game_mode: string;
  difficulty_level: string;
  created_at: string;
  user_id?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  points: number;
  level: number;
  experience: number;
}

const EnhancedRanking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    loadRankings();
    loadTopPlayers();
  }, []);

  const loadRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar rankings",
        variant: "destructive"
      });
    }
  };

  const loadTopPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points, level, experience')
        .order('points', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTopPlayers(data || []);
    } catch (error) {
      console.error('Error loading top players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPlayerLevel = (experience: number) => {
    return Math.floor(experience / 1000) + 1;
  };

  const getNextLevelProgress = (experience: number) => {
    const currentLevelExp = (getPlayerLevel(experience) - 1) * 1000;
    const nextLevelExp = getPlayerLevel(experience) * 1000;
    return ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  };

  const filterRankingsByMode = (mode: string) => {
    if (mode === 'global') return rankings;
    return rankings.filter(r => r.game_mode === mode);
  };

  const getUserRank = (userId: string) => {
    const userRanking = topPlayers.findIndex(p => p.id === userId);
    return userRanking >= 0 ? userRanking + 1 : null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-card animate-pulse rounded-lg"></div>
        <div className="h-64 bg-card animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Rankings & Leaderboards
        </h2>
        <p className="text-muted-foreground">Compete com jogadores do mundo todo!</p>
      </div>

      {/* User Stats Card */}
      {user && (
        <Card className="bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 border-cosmic-purple/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={topPlayers.find(p => p.id === user.id)?.avatar_url} />
                  <AvatarFallback>
                    {topPlayers.find(p => p.id === user.id)?.full_name?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {topPlayers.find(p => p.id === user.id)?.full_name || 'Jogador'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Rank #{getUserRank(user.id) || 'N/A'}</span>
                    <span>Nível {topPlayers.find(p => p.id === user.id)?.level || 1}</span>
                    <span>{topPlayers.find(p => p.id === user.id)?.points || 0} pontos</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-bold text-cosmic-gold">
                    {topPlayers.find(p => p.id === user.id)?.experience || 0} XP
                  </span>
                </div>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light h-2 rounded-full transition-all"
                    style={{ width: `${getNextLevelProgress(topPlayers.find(p => p.id === user.id)?.experience || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="classic">Clássico</TabsTrigger>
          <TabsTrigger value="battle">Batalha</TabsTrigger>
          <TabsTrigger value="top-players">Top Players</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-cosmic-gold" />
                <span>Ranking Global</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filterRankingsByMode('global').slice(0, 20).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="font-semibold">{entry.player_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.games_played} jogos • {entry.difficulty_level}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cosmic-gold">{entry.score}</div>
                      <Badge variant="outline" className="text-xs">
                        {entry.game_mode}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Modo Clássico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filterRankingsByMode('classic').slice(0, 20).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold w-6 text-center">#{index + 1}</span>
                      <div>
                        <div className="font-semibold">{entry.player_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.games_played} jogos
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-cosmic-gold">{entry.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="battle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Modo Batalha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filterRankingsByMode('battle').slice(0, 20).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold w-6 text-center">#{index + 1}</span>
                      <div>
                        <div className="font-semibold">{entry.player_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.games_played} batalhas
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-cosmic-gold">{entry.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-cosmic-gold" />
                <span>Top Players por Pontos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlayers.slice(0, 20).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                    <div className="flex items-center space-x-4">
                      {getRankIcon(index + 1)}
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback>{player.full_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{player.full_name || 'Jogador Anônimo'}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <span>Nível {player.level}</span>
                          <Zap className="w-3 h-3" />
                          <span>{player.experience} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cosmic-gold">{player.points}</div>
                      <div className="text-sm text-muted-foreground">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRanking;