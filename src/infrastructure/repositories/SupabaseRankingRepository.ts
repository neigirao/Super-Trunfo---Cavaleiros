/**
 * Implementação do repositório de ranking usando Supabase
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { IRankingRepository, UpdateRankingData } from '@/domain/interfaces';
import type { RankingEntry } from '@/types';
import { RepositoryError } from './SupabaseCardRepository';

/**
 * Repositório de ranking usando Supabase
 */
export class SupabaseRankingRepository implements IRankingRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  /**
   * Atualiza estatísticas após partida
   */
  async updateStats(
    userId: string,
    userEmail: string | undefined,
    data: UpdateRankingData
  ): Promise<void> {
    // Busca ranking atual
    const { data: current } = await this.supabaseClient
      .from('card_game_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const stats = this.calculateNewStats(current, data);

    const { error } = await this.supabaseClient
      .from('card_game_rankings')
      .upsert({
        user_id: userId,
        player_name: userEmail?.split('@')[0] || 'Jogador',
        ...stats,
        updated_at: new Date().toISOString(),
        last_played_at: new Date().toISOString()
      });

    if (error) {
      throw new RepositoryError('Falha ao atualizar ranking', error);
    }
  }

  /**
   * Busca ranking do usuário
   */
  async findByUserId(userId: string): Promise<RankingEntry | null> {
    const { data, error } = await this.supabaseClient
      .from('card_game_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new RepositoryError('Falha ao buscar ranking do usuário', error);
    }

    return data;
  }

  /**
   * Busca top rankings
   */
  async getTopRankings(limit: number = 10): Promise<RankingEntry[]> {
    const { data, error } = await this.supabaseClient
      .from('card_game_rankings')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new RepositoryError('Falha ao buscar top rankings', error);
    }

    return data || [];
  }

  /**
   * Busca posição do usuário no ranking
   */
  async getUserPosition(userId: string): Promise<number | null> {
    // Busca todos rankings ordenados
    const { data: allRankings, error } = await this.supabaseClient
      .from('card_game_rankings')
      .select('user_id, total_score')
      .order('total_score', { ascending: false });

    if (error) {
      throw new RepositoryError('Falha ao buscar posição do usuário', error);
    }

    if (!allRankings) return null;

    const position = allRankings.findIndex(r => r.user_id === userId);
    return position >= 0 ? position + 1 : null;
  }

  /**
   * Calcula estatísticas globais
   */
  async getGlobalStats(): Promise<{
    totalGames: number;
    totalPlayers: number;
    averageScore: number;
  }> {
    const { data, error } = await this.supabaseClient
      .from('card_game_rankings')
      .select('total_games, total_score');

    if (error) {
      throw new RepositoryError('Falha ao buscar estatísticas globais', error);
    }

    if (!data || data.length === 0) {
      return { totalGames: 0, totalPlayers: 0, averageScore: 0 };
    }

    const totalGames = data.reduce((sum, r) => sum + (r.total_games || 0), 0);
    const totalScore = data.reduce((sum, r) => sum + (r.total_score || 0), 0);
    const averageScore = totalScore / data.length;

    return {
      totalGames,
      totalPlayers: data.length,
      averageScore: Math.round(averageScore)
    };
  }

  /**
   * Calcula novas estatísticas baseado na partida
   */
  private calculateNewStats(current: any, data: UpdateRankingData) {
    const isFirstGame = !current;
    
    const totalGames = (current?.total_games || 0) + 1;
    const gamesWon = (current?.games_won || 0) + (data.victory ? 1 : 0);
    const gamesLost = (current?.games_lost || 0) + (data.victory ? 0 : 1);
    const totalScore = (current?.total_score || 0) + data.score;
    const winRate = (gamesWon / totalGames) * 100;

    // Streak
    let currentStreak = current?.current_streak || 0;
    if (data.victory) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }
    const longestStreak = Math.max(current?.longest_streak || 0, currentStreak);

    // Highest score
    const highestScore = Math.max(current?.highest_score || 0, data.score);

    return {
      total_games: totalGames,
      games_won: gamesWon,
      games_lost: gamesLost,
      total_score: totalScore,
      win_rate: Number(winRate.toFixed(2)),
      current_streak: currentStreak,
      longest_streak: longestStreak,
      highest_score: highestScore
    };
  }
}
