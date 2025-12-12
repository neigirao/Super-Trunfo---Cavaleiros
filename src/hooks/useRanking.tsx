/**
 * Hook otimizado para operações de ranking com React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RankingService, RankingFilterOptions, GlobalStatsDTO, UserStatsDTO } from '@/application/services/RankingService';
import { SupabaseRankingRepository } from '@/infrastructure/repositories/SupabaseRankingRepository';
import type { RankingEntry } from '@/types';

// Instância singleton do serviço
const rankingRepository = new SupabaseRankingRepository(supabase);
const rankingService = new RankingService(rankingRepository);

// Query keys constantes
export const RANKING_QUERY_KEYS = {
  all: ['ranking'] as const,
  list: (filters?: RankingFilterOptions) => [...RANKING_QUERY_KEYS.all, 'list', filters] as const,
  user: (userId: string) => [...RANKING_QUERY_KEYS.all, 'user', userId] as const,
  stats: () => [...RANKING_QUERY_KEYS.all, 'stats'] as const,
};

/**
 * Hook para buscar top rankings
 */
export function useTopRankings(options: RankingFilterOptions = {}) {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.list(options),
    queryFn: () => rankingService.getTopRankings(options),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar estatísticas do usuário
 */
export function useUserStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: RANKING_QUERY_KEYS.user(user?.id || ''),
    queryFn: () => rankingService.getUserStats(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para buscar estatísticas globais
 */
export function useGlobalStats() {
  return useQuery({
    queryKey: RANKING_QUERY_KEYS.stats(),
    queryFn: () => rankingService.getGlobalStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para atualizar estatísticas após partida
 */
export function useUpdateStats() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ victory, score }: { victory: boolean; score: number }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      return rankingService.updateStats(user.id, user.email, { victory, score });
    },
    onSuccess: () => {
      // Invalida todas as queries de ranking
      queryClient.invalidateQueries({ queryKey: RANKING_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook completo para ranking com filtros e paginação
 */
export function useRankingData(filterOptions: RankingFilterOptions = {}) {
  const { user } = useAuth();
  
  const { 
    data: rankings = [], 
    isLoading: isLoadingRankings, 
    error: rankingsError 
  } = useTopRankings(filterOptions);
  
  const { 
    data: userStats, 
    isLoading: isLoadingUser, 
    error: userError 
  } = useUserStats();
  
  const { 
    data: globalStats, 
    isLoading: isLoadingGlobal, 
    error: globalError 
  } = useGlobalStats();

  // Memoiza ranking formatado com posições
  const rankedList = useMemo(() => {
    return rankings.map((entry, index) => ({
      ...entry,
      position: index + 1,
      tier: rankingService.calculateTier(entry.total_score),
      formattedStats: rankingService.formatStats(entry),
    }));
  }, [rankings]);

  // Memoiza ranking do usuário na lista
  const userRankInList = useMemo(() => {
    if (!user?.id) return null;
    return rankedList.find(r => r.user_id === user.id) || null;
  }, [rankedList, user?.id]);

  // Memoiza informações de tier do usuário
  const userTierInfo = useMemo(() => {
    if (!userStats?.ranking) return null;
    return rankingService.getTierInfo(userStats.ranking.total_score);
  }, [userStats]);

  return {
    rankings: rankedList,
    userStats,
    userRankInList,
    userTierInfo,
    globalStats,
    isLoading: isLoadingRankings || isLoadingUser || isLoadingGlobal,
    error: rankingsError || userError || globalError,
    userId: user?.id,
  };
}

/**
 * Hook para calcular pontos de partida
 */
export function useMatchPointsCalculator() {
  return useMemo(() => ({
    calculate: (
      victory: boolean, 
      opponentScore: number, 
      playerScore: number, 
      streak: number
    ) => {
      return rankingService.calculateMatchPoints(victory, opponentScore, playerScore, streak);
    },
    getTier: (score: number) => rankingService.calculateTier(score),
    getTierInfo: (score: number) => rankingService.getTierInfo(score),
    getProgress: (score: number) => rankingService.calculateNextTierProgress(score),
  }), []);
}

// Exporta o serviço para uso direto quando necessário
export { rankingService };
