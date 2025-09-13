import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  knight_name: string;
  rarity: string;
  element_type: string;
}

const MINIMUM_CARDS_REQUIRED = 6;

export const useMinimumCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasMinimumCards, setHasMinimumCards] = useState(false);
  const [userCardsCount, setUserCardsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ensuring, setEnsuring] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserCards();
    }
  }, [user]);

  const checkUserCards = async () => {
    if (!user) return;

    try {
      const { data: userCards, error } = await supabase
        .from('user_cards')
        .select('id, quantity')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalCards = userCards?.reduce((total, card) => total + card.quantity, 0) || 0;
      setUserCardsCount(totalCards);
      setHasMinimumCards(totalCards >= MINIMUM_CARDS_REQUIRED);

      // Se não tem cartas suficientes, tentar garantir automaticamente
      if (totalCards < MINIMUM_CARDS_REQUIRED) {
        await ensureMinimumCards();
      }
    } catch (error) {
      console.error('Erro ao verificar cartas:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureMinimumCards = async () => {
    if (!user || ensuring) return;

    setEnsuring(true);
    try {
      // Tentar primeiro com a edge function
      const { data, error } = await supabase.functions.invoke('ensure-minimum-cards');
      
      if (error) {
        console.error('Edge function error:', error);
        // Fallback para implementação local
        await ensureMinimumCardsLocal();
      } else if (data?.success) {
        if (data.cardsAdded > 0) {
          toast({
            title: `${data.cardsAdded} Cavaleiros Recebidos! 🎉`,
            description: `Agora você tem ${data.totalCards} cavaleiros total!`,
          });
        }
        await checkUserCards(); // Recheck cards after adding
      }
    } catch (error) {
      console.error('Erro ao garantir cartas mínimas:', error);
      // Fallback para implementação local
      await ensureMinimumCardsLocal();
    } finally {
      setEnsuring(false);
    }
  };

  const ensureMinimumCardsLocal = async () => {
    if (!user) return;

    try {
      // Verificar se já recebeu pacote inicial
      const { data: packHistory } = await supabase
        .from('user_pack_openings')
        .select('id')
        .eq('user_id', user.id)
        .eq('pack_type', 'starter')
        .maybeSingle();

      if (!packHistory) {
        await giveStarterPack();
      } else {
        // Se já recebeu pacote inicial mas ainda não tem cartas suficientes,
        // dar cartas básicas adicionais
        await giveEmergencyCards();
      }
    } catch (error) {
      console.error('Erro na implementação local:', error);
    }
  };

  const giveStarterPack = async () => {
    if (!user) return;

    try {
      // Buscar cartas comuns para dar como iniciais
      const { data: commonCards, error: cardsError } = await supabase
        .from('element_cards')
        .select('*')
        .eq('rarity', 'common')
        .limit(10);

      if (cardsError) throw cardsError;

      if (!commonCards || commonCards.length === 0) {
        throw new Error('Nenhuma carta comum encontrada');
      }

      // Selecionar 6 cartas aleatórias
      const selectedCards = [];
      const availableCards = [...commonCards];
      
      for (let i = 0; i < Math.min(6, availableCards.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        selectedCards.push(availableCards.splice(randomIndex, 1)[0]);
      }

      // Registrar abertura do pacote inicial
      const { error: packError } = await supabase
        .from('user_pack_openings')
        .insert({
          user_id: user.id,
          pack_type: 'starter',
          cards_obtained: selectedCards.map(card => ({ id: card.id, rarity: card.rarity }))
        });

      if (packError) throw packError;

      // Adicionar cartas à coleção
      for (const card of selectedCards) {
        await supabase
          .from('user_cards')
          .insert({
            user_id: user.id,
            card_id: card.id,
            quantity: 1
          });
      }

      setUserCardsCount(prev => prev + selectedCards.length);
      setHasMinimumCards(true);

      toast({
        title: "Pacote Inicial Recebido! 🎉",
        description: `Você recebeu ${selectedCards.length} cavaleiros para começar a jogar!`,
      });

    } catch (error) {
      console.error('Erro ao dar pacote inicial:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fornecer o pacote inicial",
        variant: "destructive"
      });
    }
  };

  const giveEmergencyCards = async () => {
    if (!user) return;

    try {
      const { data: userCards } = await supabase
        .from('user_cards')
        .select('id, quantity')
        .eq('user_id', user.id);

      const currentTotal = userCards?.reduce((total, card) => total + card.quantity, 0) || 0;
      const needed = MINIMUM_CARDS_REQUIRED - currentTotal;

      if (needed <= 0) return;

      // Buscar cartas comuns para completar
      const { data: commonCards, error: cardsError } = await supabase
        .from('element_cards')
        .select('*')
        .eq('rarity', 'common')
        .limit(needed + 5); // Pegar algumas extras para diversidade

      if (cardsError) throw cardsError;

      if (!commonCards || commonCards.length === 0) return;

      // Buscar cartas que o usuário já possui
      const { data: userCardsWithCardId } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', user.id);

      const userCardIds = userCardsWithCardId?.map(uc => uc.card_id) || [];
      const availableCards = commonCards.filter(card => !userCardIds.includes(card.id));
      
      const selectedCards = [];
      for (let i = 0; i < Math.min(needed, availableCards.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        selectedCards.push(availableCards.splice(randomIndex, 1)[0]);
      }

      // Adicionar cartas à coleção
      for (const card of selectedCards) {
        await supabase
          .from('user_cards')
          .insert({
            user_id: user.id,
            card_id: card.id,
            quantity: 1
          });
      }

      if (selectedCards.length > 0) {
        setUserCardsCount(prev => prev + selectedCards.length);
        setHasMinimumCards(true);

        toast({
          title: "Cartas Extras Recebidas! ✨",
          description: `Você recebeu ${selectedCards.length} cavaleiros adicionais!`,
        });
      }

    } catch (error) {
      console.error('Erro ao dar cartas de emergência:', error);
    }
  };

  const forceEnsureCards = async () => {
    setLoading(true);
    await ensureMinimumCards();
    await checkUserCards();
  };

  return {
    hasMinimumCards,
    userCardsCount,
    minimumRequired: MINIMUM_CARDS_REQUIRED,
    loading,
    ensuring,
    forceEnsureCards,
    recheckCards: checkUserCards
  };
};