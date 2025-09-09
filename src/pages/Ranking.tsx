import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Crown, Medal, Star, Sword, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface RankingEntry {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  difficulty_level?: string;
  game_mode: string;
  created_at: string;
  user_id?: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
}

const Ranking = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [currentGameMode, setCurrentGameMode] = useState('classic');

  useEffect(() => {
    if (!loading) {
      loadRankings();
      loadProfiles();
    }
  }, [loading, currentGameMode]);

  const loadRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('game_mode', currentGameMode)
        .order('score', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRankings(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar ranking",
        variant: "destructive"
      });
    } finally {
      setRankingLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      // Ignore error for profiles as it's optional data
    }
  };

  const getProfileByUserId = (userId: string | undefined) => {
    if (!userId) return null;
    return profiles.find(p => p.id === userId);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-cosmic-gold" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-6 h-6 text-cosmic-blue" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'muito_facil': return 'bg-green-500';
      case 'facil': return 'bg-blue-500';
      case 'medio': return 'bg-yellow-500';
      case 'dificil': return 'bg-orange-500';
      case 'muito_dificil': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'muito_facil': return 'Muito Fácil';
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      case 'muito_dificil': return 'Muito Difícil';
      default: return 'N/A';
    }
  };

  if (loading || rankingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cosmic-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentUserRank = rankings.findIndex(r => r.user_id === user.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-gold opacity-10 rounded-full animate-stellar-pulse" />
        <div className="absolute top-3/4 right-1/3 w-48 h-48 bg-cosmic-purple opacity-15 rounded-full animate-cosmic-float" />
        <div className="absolute bottom-1/4 left-2/3 w-32 h-32 bg-cosmic-blue opacity-20 rounded-full animate-stellar-pulse" />
      </div>

      <div className="relative pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Ranking Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Hall da Fama
            </h1>
            <p className="text-muted-foreground mb-6">
              Os maiores cavaleiros dos elementos da galáxia
            </p>
            
            {currentUserRank > 0 && (
              <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-lg border-cosmic-gold/30 mb-6">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Sua Posição</div>
                    <div className="text-2xl font-bold text-cosmic-gold">#{currentUserRank}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Pontuação</div>
                    <div className="text-2xl font-bold text-cosmic-blue">
                      {rankings[currentUserRank - 1]?.score || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="classic" className="w-full" onValueChange={setCurrentGameMode}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="classic">Clássico</TabsTrigger>
              <TabsTrigger value="battle">Batalha</TabsTrigger>
            </TabsList>

            <TabsContent value="classic" className="space-y-4">
              {rankings.length === 0 ? (
                <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="text-center">
                    <Trophy className="w-16 h-16 mx-auto text-cosmic-gold mb-4" />
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                      Nenhum Cavaleiro Ainda
                    </CardTitle>
                    <CardDescription>
                      Seja o primeiro a aparecer no hall da fama!
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rankings.map((entry, index) => {
                    const profile = getProfileByUserId(entry.user_id);
                    const isCurrentUser = entry.user_id === user.id;
                    
                    return (
                      <Card key={entry.id} className={`bg-card/80 backdrop-blur-lg border-primary/20 transition-all hover:shadow-cosmic ${isCurrentUser ? 'border-cosmic-gold/50 shadow-cosmic' : ''}`}>
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-gold/20 to-cosmic-gold/5">
                              {getRankIcon(index + 1)}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="bg-cosmic-gold/20 text-cosmic-gold font-semibold">
                                  {entry.player_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className="font-semibold text-cosmic-gold">
                                  {profile?.full_name || entry.player_name}
                                  {isCurrentUser && <span className="ml-2 text-cosmic-blue text-sm">(Você)</span>}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.games_played} jogos
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {entry.difficulty_level && (
                              <Badge className={`${getDifficultyColor(entry.difficulty_level)} text-white text-xs`}>
                                {getDifficultyLabel(entry.difficulty_level)}
                              </Badge>
                            )}
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-cosmic-gold">
                                {entry.score.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                #{index + 1}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="battle" className="space-y-4">
              <Card className="bg-card/80 backdrop-blur-lg border-primary/20">
                <CardHeader className="text-center">
                  <Sword className="w-16 h-16 mx-auto text-cosmic-gold mb-4" />
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                    Modo Batalha
                  </CardTitle>
                  <CardDescription>
                    Em breve: ranking das batalhas entre cavaleiros
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Ranking;