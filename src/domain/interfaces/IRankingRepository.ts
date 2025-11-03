/**
 * Interface do repositório de ranking
 * Define o contrato para operações de ranking e estatísticas
 */

import type { RankingEntry } from '@/types';

/**
 * Dados para atualização de ranking
 */
export interface UpdateRankingData {
  victory: boolean;
  score: number;
  gameDuration?: number;
  deckName?: string;
}

/**
 * Contrato para repositório de ranking
 */
export interface IRankingRepository {
  /**
   * Atualiza estatísticas do usuário após uma partida
   * @param userId - ID do usuário
   * @param userEmail - Email do usuário (opcional)
   * @param data - Dados da partida
   */
  updateStats(
    userId: string,
    userEmail: string | undefined,
    data: UpdateRankingData
  ): Promise<void>;

  /**
   * Busca ranking do usuário específico
   * @param userId - ID do usuário
   * @returns Promise com dados do ranking ou null
   */
  findByUserId(userId: string): Promise<RankingEntry | null>;

  /**
   * Busca top rankings
   * @param limit - Número máximo de resultados (padrão: 10)
   * @returns Promise com array de rankings
   */
  getTopRankings(limit?: number): Promise<RankingEntry[]>;

  /**
   * Busca posição do usuário no ranking global
   * @param userId - ID do usuário
   * @returns Promise com a posição (1-indexed) ou null
   */
  getUserPosition(userId: string): Promise<number | null>;

  /**
   * Calcula estatísticas gerais do jogo
   * @returns Promise com estatísticas agregadas
   */
  getGlobalStats(): Promise<{
    totalGames: number;
    totalPlayers: number;
    averageScore: number;
  }>;
}
