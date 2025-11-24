import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMinimumCards } from '@/hooks/useMinimumCards';
import { Star, Sword, Shield, Zap, Lock, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CollectionFilters from '@/components/collection/CollectionFilters';
import CollectionStats from '@/components/collection/CollectionStats';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { SkeletonCardGrid } from '@/components/ui/SkeletonCard';

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

interface UserCard {
  id: string;
  card_id: string;
  quantity: number;
  element_cards: ElementCard;
}

const Collection = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { hasMinimumCards, userCardsCount, minimumRequired, forceEnsureCards } = useMinimumCards();
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [allCards, setAllCards] = useState<ElementCard[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedElement, setSelectedElement] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    if (!loading && user) {
      loadCollection();
      loadAllCards();
    }
  }, [user, loading]);

  const loadCollection = async () => {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          element_cards:card_id (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserCards(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar coleção",
        variant: "destructive"
      });
    }
  };

  const loadAllCards = async () => {
    try {
      const { data, error } = await supabase
        .from('element_cards')
        .select('*')
        .order('atomic_number');

      if (error) throw error;
      setAllCards(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cartas",
        variant: "destructive"
      });
    } finally {
      setCollectionLoading(false);
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

  const isCardOwned = (cardId: string) => {
    return userCards.some(uc => uc.card_id === cardId);
  };

  const getCardQuantity = (cardId: string) => {
    const userCard = userCards.find(uc => uc.card_id === cardId);
    return userCard?.quantity || 0;
  };

  // Filter and sort logic
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.knight_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }

    // Element type filter
    if (selectedElement !== 'all') {
      filtered = filtered.filter(card => card.element_type === selectedElement);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rarity_desc': {
          const rarityOrder: { [key: string]: number } = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        }
        case 'rarity_asc': {
          const rarityOrder: { [key: string]: number } = { legendary: 4, epic: 3, rare: 2, common: 1 };
          return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
        }
        case 'atomic_asc':
          return a.atomic_number - b.atomic_number;
        case 'atomic_desc':
          return b.atomic_number - a.atomic_number;
        default:
          return 0;
      }
    });

    return sorted;
  }, [allCards, searchTerm, selectedRarity, selectedElement, sortBy]);

  const filteredUserCards = useMemo(() => {
    return userCards.filter(uc => 
      filteredAndSortedCards.some(card => card.id === uc.card_id)
    );
  }, [userCards, filteredAndSortedCards]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRarity('all');
    setSelectedElement('all');
    setSortBy('name_asc');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedRarity !== 'all' || selectedElement !== 'all');

  // Calculate rarity breakdown
  const rarityBreakdown = useMemo(() => {
    const breakdown = { common: 0, rare: 0, epic: 0, legendary: 0 };
    userCards.forEach(uc => {
      const rarity = uc.element_cards.rarity;
      if (rarity in breakdown) {
        breakdown[rarity as keyof typeof breakdown] += 1;
      }
    });
    return breakdown;
  }, [userCards]);

  if (loading || collectionLoading) {
    return <LoadingScreen variant="splash" message="Carregando coleção..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const ownedCards = userCards.length;
  const totalCards = allCards.length;
  const completionRate = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;

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
        <div className="max-w-7xl mx-auto">
          {/* Collection Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
              Coleção de Cavaleiros
            </h1>
            <p className="text-muted-foreground mb-6">
              Gerencie e explore seus elementos químicos
            </p>
          </motion.div>

          {/* Collection Stats */}
          <CollectionStats
            ownedCards={ownedCards}
            totalCards={totalCards}
            rarityBreakdown={rarityBreakdown}
          />

          {/* Filters */}
          <CollectionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRarity={selectedRarity}
            onRarityChange={setSelectedRarity}
            selectedElement={selectedElement}
            onElementChange={setSelectedElement}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
              <TabsTrigger value="all">Todos os Cavaleiros</TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-6">
              {filteredUserCards.length === 0 && userCards.length === 0 ? (
                <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="text-center">
                    <Gift className="w-16 h-16 mx-auto text-cosmic-gold mb-4" />
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent">
                      Coleção Vazia
                    </CardTitle>
                    <CardDescription>
                      Colete seus primeiros cavaleiros para começar a aventura!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark"
                      onClick={forceEnsureCards}
                    >
                      🎁 Obter Cavaleiros Iniciais
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/game'}
                    >
                      Ir para Arena
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredUserCards.length === 0 ? (
                <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-lg border-primary/20">
                  <CardHeader className="text-center">
                    <CardTitle>Nenhum resultado</CardTitle>
                    <CardDescription>
                      Nenhuma carta encontrada com os filtros aplicados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpar Filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUserCards.map((userCard, index) => (
                      <motion.div
                        key={userCard.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <Card className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg hover:shadow-cosmic transition-all hover:scale-105">
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4 relative">
                          <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(userCard.element_cards.rarity)} to-${getRarityColor(userCard.element_cards.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic`}>
                            <span className="text-2xl font-bold text-cosmic-dark">
                              {userCard.element_cards.symbol}
                            </span>
                          </div>
                          {userCard.quantity > 1 && (
                            <Badge className="absolute -top-2 -right-2 bg-cosmic-gold text-cosmic-dark">
                              {userCard.quantity}x
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg font-bold text-cosmic-gold">
                          {userCard.element_cards.knight_name}
                        </CardTitle>
                        
                        <CardDescription>
                          {userCard.element_cards.name} (#{userCard.element_cards.atomic_number})
                        </CardDescription>
                        
                        <div className="flex justify-center items-center space-x-2 mt-2">
                          <Badge variant="outline" className="border-cosmic-gold/30 text-xs">
                            {getElementTypeIcon(userCard.element_cards.element_type)}
                            <span className="ml-1 capitalize">{userCard.element_cards.element_type.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className={`border-${getRarityColor(userCard.element_cards.rarity)}/30 text-xs`}>
                            <span className="capitalize">{userCard.element_cards.rarity}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedCards.map((card, index) => {
                    const owned = isCardOwned(card.id);
                    const quantity = getCardQuantity(card.id);
                    
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <Card className={`bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg transition-all ${owned ? 'hover:shadow-cosmic hover:scale-105' : 'opacity-60'}`}>
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4 relative">
                          <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic ${!owned ? 'grayscale' : ''}`}>
                            {owned ? (
                              <span className="text-2xl font-bold text-cosmic-dark">
                                {card.symbol}
                              </span>
                            ) : (
                              <Lock className="w-6 h-6 text-cosmic-dark" />
                            )}
                          </div>
                          {quantity > 1 && (
                            <Badge className="absolute -top-2 -right-2 bg-cosmic-gold text-cosmic-dark">
                              {quantity}x
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className={`text-lg font-bold ${owned ? 'text-cosmic-gold' : 'text-muted-foreground'}`}>
                          {owned ? card.knight_name : '???'}
                        </CardTitle>
                        
                        <CardDescription>
                          {card.name} (#{card.atomic_number})
                        </CardDescription>
                        
                        <div className="flex justify-center items-center space-x-2 mt-2">
                          <Badge variant="outline" className="border-cosmic-gold/30 text-xs">
                            {getElementTypeIcon(card.element_type)}
                            <span className="ml-1 capitalize">{card.element_type.replace('_', ' ')}</span>
                          </Badge>
                          <Badge variant="outline" className={`border-${getRarityColor(card.rarity)}/30 text-xs`}>
                            <span className="capitalize">{card.rarity}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Collection;