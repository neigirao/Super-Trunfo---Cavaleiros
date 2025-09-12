import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, CheckCircle, ArrowRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: Array<{
    type: 'text' | 'action';
    content: string;
    target?: string;
  }>;
  difficulty: string;
  duration_minutes: number;
  order_index: number;
  is_required: boolean;
}

interface TutorialProgress {
  is_completed: boolean;
  current_step: number;
  completed_at: string | null;
}

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoStart?: boolean;
}

const Tutorial = ({ open, onOpenChange, autoStart = false }: TutorialProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [progress, setProgress] = useState<Record<string, TutorialProgress>>({});
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorials();
  }, [user]);

  useEffect(() => {
    if (autoStart && tutorials.length > 0 && user) {
      const nextRequiredTutorial = tutorials.find(t => 
        t.is_required && !progress[t.id]?.is_completed
      );
      if (nextRequiredTutorial) {
        startTutorial(nextRequiredTutorial);
      }
    }
  }, [autoStart, tutorials, progress, user]);

  const loadTutorials = async () => {
    try {
      const { data: tutorialsData, error: tutorialsError } = await supabase
        .from('tutorials')
        .select('*')
        .order('order_index');

      if (tutorialsError) throw tutorialsError;

      const processedTutorials = (tutorialsData || []).map(tutorial => ({
        ...tutorial,
        content: Array.isArray(tutorial.content) ? tutorial.content : JSON.parse(tutorial.content as string)
      })) as Tutorial[];
      setTutorials(processedTutorials);

      if (user && tutorialsData?.length) {
        const tutorialIds = tutorialsData.map(t => t.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_tutorial_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('tutorial_id', tutorialIds);

        if (progressError) throw progressError;

        const progressMap = progressData?.reduce((acc, p) => {
          acc[p.tutorial_id] = p;
          return acc;
        }, {} as Record<string, TutorialProgress>) || {};

        setProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading tutorials:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar tutoriais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStep(progress[tutorial.id]?.current_step || 0);
    onOpenChange(true);
  };

  const nextStep = async () => {
    if (!currentTutorial || !user) return;

    const newStep = currentStep + 1;
    
    if (newStep >= currentTutorial.content.length) {
      // Tutorial completed
      await completeTutorial();
    } else {
      setCurrentStep(newStep);
      await updateProgress(newStep, false);
    }
  };

  const completeTutorial = async () => {
    if (!currentTutorial || !user) return;

    try {
      await supabase
        .from('user_tutorial_progress')
        .upsert({
          user_id: user.id,
          tutorial_id: currentTutorial.id,
          is_completed: true,
          current_step: currentTutorial.content.length,
          completed_at: new Date().toISOString()
        });

      // Add experience points
      const { data: profile } = await supabase
        .from('profiles')
        .select('experience, points')
        .eq('id', user.id)
        .single();

      if (profile) {
        const experienceGain = currentTutorial.is_required ? 100 : 50;
        await supabase
          .from('profiles')
          .update({
            experience: (profile.experience || 0) + experienceGain,
            points: (profile.points || 0) + experienceGain
          })
          .eq('id', user.id);

        toast({
          title: "Tutorial Completo! 🎉",
          description: `Você ganhou ${experienceGain} pontos de experiência!`,
        });
      }

      setCurrentTutorial(null);
      onOpenChange(false);
      loadTutorials();
    } catch (error) {
      console.error('Error completing tutorial:', error);
      toast({
        title: "Erro",
        description: "Falha ao completar tutorial",
        variant: "destructive"
      });
    }
  };

  const updateProgress = async (step: number, completed: boolean) => {
    if (!currentTutorial || !user) return;

    try {
      await supabase
        .from('user_tutorial_progress')
        .upsert({
          user_id: user.id,
          tutorial_id: currentTutorial.id,
          current_step: step,
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleActionClick = (target?: string) => {
    if (target) {
      onOpenChange(false);
      navigate(`/${target}`);
    }
    nextStep();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const currentContent = currentTutorial?.content[currentStep];
  const progressPercentage = currentTutorial 
    ? ((currentStep + 1) / currentTutorial.content.length) * 100 
    : 0;

  return (
    <>
      {/* Tutorial List Dialog */}
      {!currentTutorial && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cosmic-gold" />
                <span>Tutoriais</span>
              </DialogTitle>
              <DialogDescription>
                Aprenda a jogar Super Trunfo Químico com nossos tutoriais interativos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-card animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                tutorials.map((tutorial) => {
                  const tutorialProgress = progress[tutorial.id];
                  const isCompleted = tutorialProgress?.is_completed || false;
                  const isInProgress = tutorialProgress && !isCompleted;

                  return (
                    <Card 
                      key={tutorial.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${isCompleted ? 'opacity-75' : ''}`}
                      onClick={() => !isCompleted && startTutorial(tutorial)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{tutorial.title}</h3>
                              {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {tutorial.is_required && !isCompleted && (
                                <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{tutorial.duration_minutes} min</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}
                              >
                                {tutorial.difficulty}
                              </Badge>
                            </div>

                            {isInProgress && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progresso</span>
                                  <span>{tutorialProgress.current_step} / {tutorial.content.length}</span>
                                </div>
                                <Progress 
                                  value={(tutorialProgress.current_step / tutorial.content.length) * 100} 
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                          
                          {!isCompleted && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Active Tutorial Dialog */}
      {currentTutorial && (
        <Dialog open={open} onOpenChange={(open) => {
          if (!open) {
            setCurrentTutorial(null);
          }
          onOpenChange(open);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{currentTutorial.title}</span>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} / {currentTutorial.content.length}
                </Badge>
              </DialogTitle>
              <Progress value={progressPercentage} className="h-2" />
            </DialogHeader>

            <div className="space-y-6">
              {currentContent && (
                <div className="space-y-4">
                  <div className="bg-card/50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{currentContent.content}</p>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Fechar
                    </Button>

                    <Button
                      onClick={() => currentContent.type === 'action' 
                        ? handleActionClick(currentContent.target)
                        : nextStep()
                      }
                      className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
                    >
                      {currentContent.type === 'action' ? 'Ir para ' + currentContent.target : 'Próximo'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Tutorial;