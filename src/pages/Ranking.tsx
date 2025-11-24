import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Crown, Medal, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RankingFilters from '@/components/ranking/RankingFilters';
import UserRankCard from '@/components/ranking/UserRankCard';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface CardGameRanking {
  id: string;
  player_name: string;
  total_score: number;
  games_won: number;
  games_lost: number;
  total_games: number;
  win_rate: number;
  highest_score: number;
  current_streak: number;
  longest_streak: number;
  favorite_element_type?: string;
  total_cards_played: number;
  average_game_duration: number;
  difficulty_level: string;
  last_played_at: string;
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
  const [rankings, setRankings] = useState<CardGameRanking[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');

  useEffect(() => {
    if (!loading) {
      loadRankings();
      loadProfiles();
    }
  }, [loading]);

  const loadRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('card_game_rankings')
        .select('*')
        .order('total_score', { ascending: false })
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

  // Filter and pagination logic
  const filteredRankings = useMemo(() => {
    let filtered = rankings;

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(r => r.difficulty_level === selectedDifficulty);
    }

    // Mode filter (if the data has this field in the future)
    // if (selectedMode !== 'all') {
    //   filtered = filtered.filter(r => r.game_mode === selectedMode);
    // }

    return filtered;
  }, [rankings, selectedDifficulty]);

  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRankings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRankings, currentPage]);

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);

  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedMode('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(selectedDifficulty !== 'all' || selectedMode !== 'all');

  if (loading || rankingLoading) {
    return <LoadingScreen variant="splash" message="Carregando ranking..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const currentUserRank = filteredRankings.findIndex(r => r.user_id === user.id) + 1;
  const currentUserData = rankings.find(r => r.user_id === user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-gold opacity-10 rounded-full animate-stellar-pulse" />
        <div className="absolute top-3/4 right-1/3 w-48 h-48 bg-cosmic-purple opacity-15 rounded-full animate-cosmic-float" />
        <div className="absolute bottom-1/4 left-2/3 w-32 h-32 bg-cosmic-blue opacity-20 rounded-full animate-stellar-pulse" />
      </div>

      <div className="relative pt-2 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Ranking Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Hall da Fama
            </h1>
            <p className="text-muted-foreground mb-6">
              Os maiores cavaleiros dos elementos da galáxia
            </p>
          </motion.div>
            
          {/* User Rank Card */}
          {currentUserRank > 0 && currentUserData && (
            <UserRankCard
              position={currentUserRank}
              totalScore={currentUserData.total_score}
              gamesWon={currentUserData.games_won}
              gamesLost={currentUserData.games_lost}
              winRate={currentUserData.win_rate}
              currentStreak={currentUserData.current_streak}
            />
          )}

          {/* Filters */}
          <RankingFilters
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <Tabs defaultValue="classic" className="w-full">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto mb-8">
              <TabsTrigger value="classic">Cavaleiros dos Elementos</TabsTrigger>
            </TabsList>

            <TabsContent value="classic" className="space-y-4">
              {paginatedRankings.length === 0 ? (
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
                <>
                  <AnimatePresence>
                    <div className="space-y-4">
                      {paginatedRankings.map((entry, index) => {
                        const profile = getProfileByUserId(entry.user_id);
                        const isCurrentUser = entry.user_id === user.id;
                        const globalIndex = (currentPage - 1) * itemsPerPage + index;
                        
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card className={`bg-card/80 backdrop-blur-lg border-primary/20 transition-all hover:shadow-cosmic ${isCurrentUser ? 'border-cosmic-gold/50 shadow-cosmic' : ''}`}>
                        <CardContent className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-gold/20 to-cosmic-gold/5">
                              {getRankIcon(globalIndex + 1)}
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
                                  {entry.total_games} jogos • Taxa: {entry.win_rate}%
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
                                {entry.total_score.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                #{globalIndex + 1}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      
                      <span className="text-sm text-muted-foreground px-4">
                        Página {currentPage} de {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Ranking;