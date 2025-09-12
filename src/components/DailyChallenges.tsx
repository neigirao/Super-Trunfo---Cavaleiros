import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Target, Clock, Star } from 'lucide-react';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  reward_points: number;
  challenge_type: string;
  target_metric: string;
}

interface ChallengeProgress {
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
}

const DailyChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (challengesError) throw challengesError;

      setChallenges(challengesData || []);

      if (user && challengesData?.length) {
        const challengeIds = challengesData.map(c => c.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('challenge_id', challengeIds);

        if (progressError) throw progressError;

        const progressMap = progressData?.reduce((acc, p) => {
          acc[p.challenge_id] = p;
          return acc;
        }, {} as Record<string, ChallengeProgress>) || {};

        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar desafios diários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: string, points: number) => {
    if (!user) return;

    try {
      // Update challenge progress as completed
      await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      // Add points to user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, experience')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            points: (profile.points || 0) + points,
            experience: (profile.experience || 0) + points
          })
          .eq('id', user.id);
      }

      toast({
        title: "Recompensa Coletada! 🎉",
        description: `Você ganhou ${points} pontos!`,
      });

      // Reload progress
      loadChallenges();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Erro",
        description: "Falha ao coletar recompensa",
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = (challengeId: string, targetValue: number) => {
    const challengeProgress = progress[challengeId];
    if (!challengeProgress) return 0;
    return Math.min((challengeProgress.current_progress / targetValue) * 100, 100);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Target className="w-5 h-5 text-cosmic-gold" />;
      case 'weekly': return <Trophy className="w-5 h-5 text-cosmic-purple" />;
      case 'special': return <Star className="w-5 h-5 text-cosmic-blue" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-card animate-pulse rounded-lg"></div>
        <div className="h-32 bg-card animate-pulse rounded-lg"></div>
        <div className="h-32 bg-card animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-2">
          Desafios Diários
        </h2>
        <p className="text-muted-foreground">Complete desafios e ganhe pontos especiais!</p>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => {
          const challengeProgress = progress[challenge.id];
          const progressPercentage = getProgressPercentage(challenge.id, challenge.target_value);
          const isCompleted = challengeProgress?.is_completed || false;
          const canClaim = progressPercentage >= 100 && !isCompleted;

          return (
            <Card key={challenge.id} className={`${isCompleted ? 'opacity-75' : ''} ${canClaim ? 'ring-2 ring-cosmic-gold' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getChallengeIcon(challenge.challenge_type)}
                    <div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{challenge.reward_points}</span>
                    </Badge>
                    {isCompleted && (
                      <Badge variant="default" className="bg-cosmic-gold text-cosmic-dark">
                        Completo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{challengeProgress?.current_progress || 0} / {challenge.target_value}</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Expira em 24h</span>
                  </div>
                  
                  {canClaim && (
                    <Button
                      onClick={() => claimReward(challenge.id, challenge.reward_points)}
                      className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
                    >
                      Coletar Recompensa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum desafio ativo</h3>
            <p className="text-muted-foreground">Novos desafios aparecem diariamente. Volte em breve!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyChallenges;