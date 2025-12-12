/**
 * Hook otimizado para operações de cartas com React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CardService, CardFilterOptions, CollectionStatsDTO } from '@/application/services/CardService';
import { SupabaseCardRepository } from '@/infrastructure/repositories/SupabaseCardRepository';
import type { ElementCard } from '@/types';

// Instância singleton do serviço
const cardRepository = new SupabaseCardRepository(supabase);
const cardService = new CardService(cardRepository);

// Query keys constantes
export const CARD_QUERY_KEYS = {
  all: ['cards'] as const,
  allCards: () => [...CARD_QUERY_KEYS.all, 'all'] as const,
  userCards: (userId: string) => [...CARD_QUERY_KEYS.all, 'user', userId] as const,
  card: (id: string) => [...CARD_QUERY_KEYS.all, 'detail', id] as const,
  count: (userId: string) => [...CARD_QUERY_KEYS.all, 'count', userId] as const,
};

/**
 * Hook para buscar todas as cartas do jogo
 */
export function useAllCards() {
  return useQuery({
    queryKey: CARD_QUERY_KEYS.allCards(),
    queryFn: () => cardService.getAllCards(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar cartas do usuário
 */
export function useUserCards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: CARD_QUERY_KEYS.userCards(user?.id || ''),
    queryFn: () => cardService.getUserCards(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para buscar uma carta específica
 */
export function useCard(cardId: string | null) {
  return useQuery({
    queryKey: CARD_QUERY_KEYS.card(cardId || ''),
    queryFn: () => cardService.getCardById(cardId!),
    enabled: !!cardId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para contar cartas do usuário
 */
export function useCardCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: CARD_QUERY_KEYS.count(user?.id || ''),
    queryFn: () => cardService.countUserCards(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para adicionar carta à coleção
 */
export function useAddCardToCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ cardId, quantity = 1 }: { cardId: string; quantity?: number }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return cardService.addCardToCollection(user.id, cardId, quantity);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.userCards(user.id) });
        queryClient.invalidateQueries({ queryKey: CARD_QUERY_KEYS.count(user.id) });
      }
    },
  });
}

/**
 * Hook completo para coleção com filtros e estatísticas
 */
export function useCardCollection(filterOptions: CardFilterOptions = {}) {
  const { user } = useAuth();
  const { data: userCards = [], isLoading: isLoadingUser, error: userError } = useUserCards();
  const { data: allCards = [], isLoading: isLoadingAll, error: allError } = useAllCards();

  // Memoiza cartas filtradas
  const filteredUserCards = useMemo(() => {
    return cardService.filterCards(userCards, filterOptions);
  }, [userCards, filterOptions]);

  const filteredAllCards = useMemo(() => {
    return cardService.filterCards(allCards, filterOptions);
  }, [allCards, filterOptions]);

  // Memoiza estatísticas
  const stats = useMemo<CollectionStatsDTO>(() => {
    return cardService.calculateCollectionStats(userCards, allCards);
  }, [userCards, allCards]);

  // Memoiza agrupamentos
  const groupedByElement = useMemo(() => {
    return cardService.groupByElement(userCards);
  }, [userCards]);

  const groupedByRarity = useMemo(() => {
    return cardService.groupByRarity(userCards);
  }, [userCards]);

  // Função para calcular poder
  const calculatePower = useCallback((card: ElementCard) => {
    return cardService.calculateCardPower(card);
  }, []);

  return {
    userCards,
    allCards,
    filteredUserCards,
    filteredAllCards,
    stats,
    groupedByElement,
    groupedByRarity,
    calculatePower,
    isLoading: isLoadingUser || isLoadingAll,
    error: userError || allError,
    userId: user?.id,
  };
}

/**
 * Hook para verificar se usuário tem cartas suficientes
 */
export function useHasMinimumCards(minimumCards: number = 6) {
  const { data: count = 0, isLoading } = useCardCount();

  return {
    hasMinimum: count >= minimumCards,
    count,
    minimumRequired: minimumCards,
    cardsNeeded: Math.max(0, minimumCards - count),
    isLoading,
  };
}

// Exporta o serviço para uso direto quando necessário
export { cardService };
