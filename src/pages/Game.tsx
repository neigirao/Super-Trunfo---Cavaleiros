import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sword, Shield, Zap, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PackOpening from '@/components/PackOpening';

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  knight_name: string;
  special_ability: string;
  rarity: string;
  element_type: string;
  image_url?: string;
}

const Game = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<ElementCard[]>([]);
  const [currentCard, setCurrentCard] = useState<ElementCard | null>(null);
  const [gameMode, setGameMode] = useState<'battle' | 'collection'>('battle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameLoading, setGameLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadCards();
    }
  }, [user, loading]);

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('element_cards')
        .select('*')
        .order('atomic_number');

      if (error) throw error;
      setCards(data || []);
      
      // Selecionar carta aleatória para começar
      if (data && data.length > 0) {
        const randomCard = data[Math.floor(Math.random() * data.length)];
        setCurrentCard(randomCard);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cartas",
        variant: "destructive"
      });
    } finally {
      setGameLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'cosmic-gold';
      case 'epic': return 'cosmic-purple';
      case 'rare': return 'cosmic-blue';
      default: return 'cosmic-green';
    }
  };

  const getElementTypeIcon = (elementType: string) => {
    switch (elementType) {
      case 'metal': return <Sword className="w-4 h-4" />;
      case 'non-metal': return <Shield className="w-4 h-4" />;
      case 'noble_gas': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (loading || gameLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cosmic-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
        <div className="max-w-7xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Arena dos Elementos
            </h1>
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cosmic-gold">{score}</div>
                <div className="text-sm text-muted-foreground">Pontuação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cosmic-blue">{streak}</div>
                <div className="text-sm text-muted-foreground">Sequência</div>
              </div>
            </div>
            
            {/* Game Mode Selector */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                variant={gameMode === 'battle' ? 'default' : 'outline'}
                onClick={() => setGameMode('battle')}
                className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark"
              >
                <Sword className="w-4 h-4 mr-2" />
                Batalha
              </Button>
              <Button
                variant={gameMode === 'collection' ? 'default' : 'outline'}
                onClick={() => setGameMode('collection')}
                className="bg-gradient-to-r from-cosmic-purple to-cosmic-purple-light hover:from-cosmic-purple-light hover:to-cosmic-purple"
              >
                <Star className="w-4 h-4 mr-2" />
                Coleção
              </Button>
            </div>
          </div>

          {gameMode === 'battle' && currentCard && (
            <div className="max-w-md mx-auto">
              <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-2xl">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-20 h-20 bg-gradient-to-br from-${getRarityColor(currentCard.rarity)} to-${getRarityColor(currentCard.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic`}>
                      <span className="text-3xl font-bold text-cosmic-dark">
                        {currentCard.symbol}
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                    {currentCard.knight_name}
                  </CardTitle>
                  
                  <CardDescription className="text-lg">
                    Cavaleiro do {currentCard.name}
                  </CardDescription>
                  
                  <div className="flex justify-center items-center space-x-2 mt-2">
                    <Badge variant="outline" className="border-cosmic-gold/30">
                      {getElementTypeIcon(currentCard.element_type)}
                      <span className="ml-1 capitalize">{currentCard.element_type.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className={`border-${getRarityColor(currentCard.rarity)}/30`}>
                      <span className="capitalize">{currentCard.rarity}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2"># Atômico</div>
                    <div className="text-3xl font-bold text-cosmic-gold">{currentCard.atomic_number}</div>
                  </div>

                  {currentCard.special_ability && (
                    <div className="text-center p-4 bg-cosmic-nebula/20 rounded-lg border border-cosmic-gold/20">
                      <div className="text-sm text-cosmic-gold font-semibold mb-1">Habilidade Especial</div>
                      <div className="text-sm">{currentCard.special_ability}</div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark font-semibold"
                    >
                      Iniciar Batalha
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={loadCards}
                    >
                      Próximo Cavaleiro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {gameMode === 'collection' && (
            <PackOpening />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;