import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMinimumCards } from '@/hooks/useMinimumCards';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const { hasMinimumCards, userCardsCount, minimumRequired, loading: cardsLoading, forceEnsureCards } = useMinimumCards();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <span className="text-xl font-semibold text-foreground">Carregando cosmos...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-96 h-96 bg-cosmic-gold opacity-5 rounded-full animate-stellar-pulse" />
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cosmic-purple opacity-10 rounded-full animate-cosmic-float" />
        <div className="absolute bottom-1/3 left-1/2 w-48 h-48 bg-cosmic-blue opacity-15 rounded-full animate-stellar-pulse" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cosmic-gold via-cosmic-gold-light to-cosmic-gold bg-clip-text text-transparent">
            Cavaleiros dos Elementos
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Domine os elementos da tabela periódica em épicas batalhas de Super Trunfo
          </p>
          
          {/* Card Status */}
          {user && !cardsLoading && (
            <div className="flex justify-center mb-6">
              <Badge 
                variant={hasMinimumCards ? "default" : "destructive"}
                className="text-sm px-4 py-2"
              >
                {hasMinimumCards 
                  ? `✅ ${userCardsCount} cavaleiros coletados` 
                  : `⚠️ ${userCardsCount}/${minimumRequired} cavaleiros (mínimo necessário)`
                }
              </Badge>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark-foreground dark:text-cosmic-dark font-bold shadow-lg hover:shadow-cosmic transition-all duration-300"
              onClick={() => navigate('/game')}
              disabled={!hasMinimumCards && !cardsLoading}
            >
              ⚔️ {hasMinimumCards ? 'Iniciar Batalha' : 'Colete Cartas Primeiro'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 text-lg border-primary/30 hover:bg-primary/10 transition-all duration-300"
              onClick={() => navigate('/collection')}
            >
              📚 Ver Coleção
            </Button>

            {!hasMinimumCards && user && !cardsLoading && (
              <Button 
                size="lg" 
                variant="secondary"
                className="h-14 px-8 text-lg"
                onClick={forceEnsureCards}
              >
                🎁 Obter Cartas Iniciais
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-gold to-cosmic-gold-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-cosmic transition-all duration-300">
                <span className="text-2xl">⚛️</span>
              </div>
              <CardTitle className="text-xl text-primary">Elementos Químicos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Cada carta representa um elemento da tabela periódica com propriedades únicas e poderes especiais
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-purple to-cosmic-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-cosmic transition-all duration-300">
                <span className="text-2xl">⚔️</span>
              </div>
              <CardTitle className="text-xl text-primary">Batalhas Épicas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Use as propriedades químicas como massa atômica e eletronegatividade para dominar seus oponentes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-lg border-primary/20 hover:border-primary/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-blue to-cosmic-purple rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-cosmic transition-all duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <CardTitle className="text-xl text-primary">Ranking Cósmico</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Suba no ranking global e prove ser o maior mestre dos elementos químicos
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <Card className="bg-gradient-to-r from-cosmic-gold/10 to-cosmic-gold-light/10 border-cosmic-gold/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">👑</span>
                <span className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                  Painel Administrativo
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Como administrador, você pode gerenciar cartas, visualizar estatísticas e configurar o jogo.
              </p>
              <Button 
                variant="outline" 
                className="border-cosmic-gold/50 text-cosmic-gold hover:bg-cosmic-gold/10"
                onClick={() => navigate('/admin')}
              >
                Acessar Dashboard Admin
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">⚛️</div>
            <div className="text-sm text-muted-foreground">Elementos Químicos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">⚔️</div>
            <div className="text-sm text-muted-foreground">Batalhas Épicas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">🏆</div>
            <div className="text-sm text-muted-foreground">Ranking Global</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">⚡</div>
            <div className="text-sm text-muted-foreground">Poderes Únicos</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
