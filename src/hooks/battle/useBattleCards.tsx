/**
 * Hook customizado para gerenciar cartas do usuário e do jogo
 * 
 * Responsável por:
 * - Carregar cartas do usuário do Supabase
 * - Carregar todas as cartas disponíveis
 * - Criar baralho do oponente
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ElementCard } from './useBattleLogic';

export const useBattleCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCards, setUserCards] = useState<ElementCard[]>([]);
  const [allCards, setAllCards] = useState<ElementCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [user]);

  const loadCards = async () => {
    setIsLoading(true);
    await Promise.all([loadUserCards(), loadAllCards()]);
    setIsLoading(false);
  };

  const loadUserCards = async () => {
    if (!user) return;
    
    // Optimized query: select only needed fields and add index hint
    const { data, error } = await supabase
      .from('user_cards')
      .select(`
        card_id,
        element_cards!inner (
          id,
          name,
          symbol,
          knight_name,
          atomic_number,
          atomic_mass,
          density,
          melting_point,
          electronegativity,
          radioactivity,
          reactivity,
          rarity,
          element_type,
          is_super_trump,
          special_ability,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('card_id');

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar suas cartas",
        variant: "destructive"
      });
      return;
    }

    const cards = data?.map(item => item.element_cards).filter(Boolean) || [];
    setUserCards(cards as ElementCard[]);
  };

  const loadAllCards = async () => {
    // Optimized query with selective fields
    const { data, error } = await supabase
      .from('element_cards')
      .select(`
        id,
        name,
        symbol,
        knight_name,
        atomic_number,
        atomic_mass,
        density,
        melting_point,
        electronegativity,
        radioactivity,
        reactivity,
        rarity,
        element_type,
        is_super_trump,
        special_ability,
        image_url
      `)
      .order('atomic_number');

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar cartas do jogo",
        variant: "destructive"
      });
      return;
    }

    setAllCards(data || []);
  };

  /**
   * Cria um baralho aleatório para o oponente
   */
  const createOpponentDeck = (deckSize: number): ElementCard[] => {
    const opponentDeck = [];
    const availableCards = [...allCards];
    
    for (let i = 0; i < deckSize; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      opponentDeck.push(availableCards[randomIndex]);
    }
    
    return opponentDeck;
  };

  return {
    userCards,
    allCards,
    isLoading,
    createOpponentDeck,
    reloadCards: loadCards
  };
};
