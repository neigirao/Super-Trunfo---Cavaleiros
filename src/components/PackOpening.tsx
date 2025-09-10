import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Star, Sword, Shield, Zap, Sparkles, Clock, Calendar } from 'lucide-react';

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
    id: 'weekly',
    name: 'Pacote Semanal',
    description: 'Sua carta semanal gratuita - 1 por semana',
    icon: Calendar,
    color: 'cosmic-gold',
    rarity_chances: {
      common: 60,
      rare: 30,
      epic: 8,
      legendary: 2
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
  const [canOpenPack, setCanOpenPack] = useState(false);
  const [nextOpeningDate, setNextOpeningDate] = useState<Date | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  useEffect(() => {
    if (user) {
      checkPackAvailability();
    }
  }, [user]);

  useEffect(() => {
    if (nextOpeningDate) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [nextOpeningDate]);

  const checkPackAvailability = async () => {
    if (!user) return;

    try {
      // Verificar se pode abrir pacote
      const { data: canOpen, error: canOpenError } = await supabase
        .rpc('can_user_open_pack', { user_uuid: user.id });

      if (canOpenError) throw canOpenError;

      setCanOpenPack(canOpen);

      // Se não pode abrir, buscar próxima data
      if (!canOpen) {
        const { data: nextDate, error: nextDateError } = await supabase
          .rpc('get_next_pack_opening_date', { user_uuid: user.id });

        if (nextDateError) throw nextDateError;

        setNextOpeningDate(new Date(nextDate));
      }
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
    }
  };

  const updateCountdown = () => {
    if (!nextOpeningDate) return;

    const now = new Date();
    const diff = nextOpeningDate.getTime() - now.getTime();

    if (diff <= 0) {
      setCanOpenPack(true);
      setNextOpeningDate(null);
      setTimeUntilNext('');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilNext(`${days}d ${hours}h ${minutes}m ${seconds}s`);
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
    if (!user || !canOpenPack) return;

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

      // Gerar apenas 1 carta baseado na raridade equilibrada
      const targetRarity = generateRandomRarity(packType.rarity_chances);
      let cardsOfRarity = allCards.filter(card => card.rarity === targetRarity);
      
      // Se não houver cartas dessa raridade, usar lógica de fallback
      if (cardsOfRarity.length === 0) {
        // Tentar raridades em ordem decrescente
        const fallbackOrder = ['epic', 'rare', 'common'];
        for (const fallbackRarity of fallbackOrder) {
          cardsOfRarity = allCards.filter(card => card.rarity === fallbackRarity);
          if (cardsOfRarity.length > 0) break;
        }
      }

      const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      
      if (!randomCard) {
        throw new Error('Nenhuma carta disponível');
      }

      const newCards = [randomCard];

      // Registrar abertura do pacote
      const { error: packOpeningError } = await supabase
        .from('user_pack_openings')
        .insert({
          user_id: user.id,
          pack_type: packType.id,
          cards_obtained: newCards.map(card => ({ id: card.id, rarity: card.rarity }))
        });

      if (packOpeningError) throw packOpeningError;

      // Adicionar carta à coleção do usuário
      const { data: existingCard } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', randomCard.id)
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
            card_id: randomCard.id,
            quantity: 1
          });
      }

      setOpenedCards(newCards);
      setShowResults(true);
      setCanOpenPack(false);

      // Calcular próxima data disponível (7 dias a partir de agora)
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);
      setNextOpeningDate(nextDate);

      toast({
        title: "Pacote Aberto!",
        description: `Você obteve o cavaleiro ${randomCard.knight_name}!`,
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

      <div className="max-w-md mx-auto">
        {packTypes.map((pack) => {
          const IconComponent = pack.icon;
          return (
            <Card key={pack.id} className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-lg hover:shadow-cosmic transition-all group">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${pack.color} to-${pack.color} rounded-full flex items-center justify-center shadow-cosmic group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-10 h-10 text-cosmic-dark" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-cosmic-gold">
                  {pack.name}
                </CardTitle>
                
                <CardDescription className="text-sm">
                  {pack.description}
                </CardDescription>
                
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <Badge variant="outline" className="border-cosmic-gold/30">
                    1 carta única
                  </Badge>
                  <Badge variant="outline" className="border-cosmic-blue/30">
                    Gratuito
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {canOpenPack ? (
                  <Button 
                    className={`w-full h-12 bg-gradient-to-r from-${pack.color} to-${pack.color} hover:opacity-90 text-cosmic-dark font-semibold`}
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
                        Abrir Pacote Semanal
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center space-y-2">
                    <Button 
                      className="w-full h-12"
                      disabled
                      variant="outline"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Próximo em: {timeUntilNext}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Você já abriu seu pacote semanal. Volte em 7 dias!
                    </p>
                  </div>
                )}

                {/* Rarity Chances */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="text-center text-muted-foreground font-medium">Probabilidades Equilibradas:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <span className="text-cosmic-green font-medium">Comum: {pack.rarity_chances.common}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-cosmic-blue font-medium">Raro: {pack.rarity_chances.rare}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-cosmic-purple font-medium">Épico: {pack.rarity_chances.epic}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-cosmic-gold font-medium">Lendário: {pack.rarity_chances.legendary}%</span>
                    </div>
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
            {selectedPack?.name} - Novo cavaleiro obtido!
          </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mt-6">
            {openedCards.map((card, index) => (
              <Card key={`${card.id}-${index}`} className="bg-card/80 backdrop-blur-lg border-primary/20 shadow-2xl animate-fade-in max-w-sm">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 bg-gradient-to-br from-${getRarityColor(card.rarity)} to-${getRarityColor(card.rarity)}-light rounded-full flex items-center justify-center shadow-cosmic animate-stellar-pulse`}>
                      <span className="text-4xl font-bold text-cosmic-dark">
                        {card.symbol}
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-cosmic-gold mb-2">
                    {card.knight_name}
                  </CardTitle>
                  
                  <CardDescription className="text-lg mb-4">
                    {card.name} (#{card.atomic_number})
                  </CardDescription>

                  {card.special_ability && (
                    <div className="p-3 bg-cosmic-nebula/20 rounded-lg border border-cosmic-gold/20 mb-4">
                      <div className="text-sm text-cosmic-gold font-semibold mb-1">Habilidade Especial</div>
                      <div className="text-xs">{card.special_ability}</div>
                    </div>
                  )}
                  
                  <div className="flex justify-center items-center space-x-2">
                    <Badge variant="outline" className="border-cosmic-gold/30">
                      {getElementTypeIcon(card.element_type)}
                      <span className="ml-1 capitalize">{card.element_type.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className={`border-${getRarityColor(card.rarity)}/30`}>
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