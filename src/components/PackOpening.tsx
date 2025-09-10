import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Star, Sword, Shield, Zap, Sparkles } from 'lucide-react';

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

interface PackType {
  id: string;
  name: string;
  description: string;
  price: number;
  cards_per_pack: number;
  icon: typeof Package;
  color: string;
  rarity_chances: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

const packTypes: PackType[] = [
  {
    id: 'starter',
    name: 'Pacote Iniciante',
    description: 'Perfeito para começar sua jornada',
    price: 100,
    cards_per_pack: 3,
    icon: Package,
    color: 'cosmic-green',
    rarity_chances: {
      common: 70,
      rare: 25,
      epic: 4,
      legendary: 1
    }
  },
  {
    id: 'premium',
    name: 'Pacote Premium',
    description: 'Cartas mais raras garantidas',
    price: 250,
    cards_per_pack: 5,
    icon: Star,
    color: 'cosmic-blue',
    rarity_chances: {
      common: 50,
      rare: 35,
      epic: 12,
      legendary: 3
    }
  },
  {
    id: 'legendary',
    name: 'Pacote Lendário',
    description: 'Uma carta lendária garantida!',
    price: 500,
    cards_per_pack: 7,
    icon: Sparkles,
    color: 'cosmic-gold',
    rarity_chances: {
      common: 30,
      rare: 40,
      epic: 25,
      legendary: 5
    }
  }
];

const PackOpening = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<ElementCard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PackType | null>(null);

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

  const generateRandomRarity = (chances: PackType['rarity_chances']): string => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(chances)) {
      cumulative += chance;
      if (random <= cumulative) {
        return rarity;
      }
    }
    return 'common';
  };

  const openPack = async (packType: PackType) => {
    if (!user) return;

    setIsOpening(true);
    setSelectedPack(packType);

    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Buscar todas as cartas disponíveis
      const { data: allCards, error } = await supabase
        .from('element_cards')
        .select('*');

      if (error) throw error;

      if (!allCards || allCards.length === 0) {
        throw new Error('Nenhuma carta encontrada');
      }

      // Gerar cartas baseado na raridade
      const newCards: ElementCard[] = [];
      for (let i = 0; i < packType.cards_per_pack; i++) {
        const targetRarity = generateRandomRarity(packType.rarity_chances);
        const cardsOfRarity = allCards.filter(card => card.rarity === targetRarity);
        
        // Se não houver cartas dessa raridade, usar cartas comuns
        const availableCards = cardsOfRarity.length > 0 ? cardsOfRarity : allCards.filter(card => card.rarity === 'common');
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        if (randomCard) {
          newCards.push(randomCard);
        }
      }

      // Adicionar cartas à coleção do usuário
      for (const card of newCards) {
        // Verificar se o usuário já tem essa carta
        const { data: existingCard } = await supabase
          .from('user_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('card_id', card.id)
          .single();

        if (existingCard) {
          // Incrementar quantidade
          await supabase
            .from('user_cards')
            .update({ quantity: existingCard.quantity + 1 })
            .eq('id', existingCard.id);
        } else {
          // Adicionar nova carta
          await supabase
            .from('user_cards')
            .insert({
              user_id: user.id,
              card_id: card.id,
              quantity: 1
            });
        }
      }

      setOpenedCards(newCards);
      setShowResults(true);

      toast({
        title: "Pacote Aberto!",
        description: `Você obteve ${newCards.length} ${newCards.length === 1 ? 'cavaleiro' : 'cavaleiros'}!`,
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao abrir pacote",
        variant: "destructive"
      });
    } finally {
      setIsOpening(false);
    }
  };

  const closeResults = () => {
    setShowResults(false);
    setOpenedCards([]);
    setSelectedPack(null);
  };

  return (
    <div className="space-y-8">
      {/* Pack Selection */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent mb-4">
          Loja de Pacotes
        </h2>
        <p className="text-muted-foreground">
          Abra pacotes e descubra novos Cavaleiros dos Elementos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {packTypes.map((pack) => {
          const IconComponent = pack.icon;
          return (
            <Card key={pack.id} className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg hover:shadow-cosmic transition-all group">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${pack.color} to-${pack.color} rounded-full flex items-center justify-center shadow-cosmic group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-cosmic-dark" />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-cosmic-gold">
                  {pack.name}
                </CardTitle>
                
                <CardDescription className="text-sm">
                  {pack.description}
                </CardDescription>
                
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <Badge variant="outline" className="border-cosmic-gold/30 text-xs">
                    {pack.cards_per_pack} cartas
                  </Badge>
                  <Badge variant="outline" className="border-cosmic-blue/30 text-xs">
                    {pack.price} pontos
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Button 
                  className={`w-full bg-gradient-to-r from-${pack.color} to-${pack.color} hover:opacity-90 text-cosmic-dark font-semibold`}
                  onClick={() => openPack(pack)}
                  disabled={isOpening}
                >
                  {isOpening && selectedPack?.id === pack.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-cosmic-dark border-t-transparent mr-2" />
                      Abrindo...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Abrir Pacote
                    </>
                  )}
                </Button>

                {/* Rarity Chances */}
                <div className="mt-4 space-y-1 text-xs">
                  <div className="text-center text-muted-foreground font-medium">Chances:</div>
                  <div className="flex justify-between">
                    <span className="text-cosmic-green">Comum: {pack.rarity_chances.common}%</span>
                    <span className="text-cosmic-blue">Raro: {pack.rarity_chances.rare}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cosmic-purple">Épico: {pack.rarity_chances.epic}%</span>
                    <span className="text-cosmic-gold">Lendário: {pack.rarity_chances.legendary}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-lg border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light bg-clip-text text-transparent text-center">
              Cavaleiros Obtidos!
            </DialogTitle>
            <DialogDescription className="text-center">
              {selectedPack?.name} - {openedCards.length} {openedCards.length === 1 ? 'cavaleiro' : 'cavaleiros'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {openedCards.map((card, index) => (
              <Card key={`${card.id}-${index}`} className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg animate-fade-in">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic animate-stellar-pulse`}>
                      <span className="text-2xl font-bold text-cosmic-dark">
                        {card.symbol}
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-bold text-cosmic-gold">
                    {card.knight_name}
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
            ))}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              variant="outline" 
              onClick={closeResults}
            >
              Fechar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cosmic-gold to-cosmic-gold-light hover:from-cosmic-gold-light hover:to-cosmic-gold text-cosmic-dark"
              onClick={() => window.location.href = '/collection'}
            >
              Ver Coleção
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackOpening;