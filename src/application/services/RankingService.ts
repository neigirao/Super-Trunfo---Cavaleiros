/**
 * Serviço de aplicação para ranking
 * Orquestra operações de ranking entre camadas
 */

import type { IRankingRepository, UpdateRankingData } from '@/domain/interfaces';
import type { RankingEntry } from '@/types';

/**
 * Estatísticas globais do jogo
 */
export interface GlobalStatsDTO {
  totalGames: number;
  totalPlayers: number;
  averageScore: number;
}

/**
 * Estatísticas do usuário com posição
 */
export interface UserStatsDTO {
  ranking: RankingEntry | null;
  position: number | null;
  tier: string;
  nextTierProgress: number;
}

/**
 * Opções de filtro para ranking
 */
export interface RankingFilterOptions {
  difficulty?: string;
  gameMode?: string;
  limit?: number;
  offset?: number;
}

/**
 * Serviço de ranking
 * Coordena operações de ranking entre domínio e infraestrutura
 */
export class RankingService {
  private readonly TIERS = [
    { name: 'Bronze', minScore: 0 },
    { name: 'Prata', minScore: 500 },
    { name: 'Ouro', minScore: 1500 },
    { name: 'Platina', minScore: 3500 },
    { name: 'Diamante', minScore: 7000 },
    { name: 'Mestre', minScore: 15000 },
    { name: 'Grão-Mestre', minScore: 30000 },
    { name: 'Lenda', minScore: 50000 }
  ];

  constructor(private rankingRepository: IRankingRepository) {}

  /**
   * Atualiza estatísticas após partida
   */
  async updateStats(
    userId: string,
    userEmail: string | undefined,
    data: UpdateRankingData
  ): Promise<void> {
    await this.rankingRepository.updateStats(userId, userEmail, data);
  }

  /**
   * Busca ranking do usuário com estatísticas completas
   */
  async getUserStats(userId: string): Promise<UserStatsDTO> {
    const [ranking, position] = await Promise.all([
      this.rankingRepository.findByUserId(userId),
      this.rankingRepository.getUserPosition(userId)
    ]);

    const totalScore = ranking?.total_score || 0;
    const tier = this.calculateTier(totalScore);
    const nextTierProgress = this.calculateNextTierProgress(totalScore);

    return {
      ranking,
      position,
      tier,
      nextTierProgress
    };
  }

  /**
   * Busca top rankings com filtros
   */
  async getTopRankings(options: RankingFilterOptions = {}): Promise<RankingEntry[]> {
    const limit = options.limit || 100;
    const rankings = await this.rankingRepository.getTopRankings(limit);

    // Aplica filtros client-side (idealmente seria no banco)
    let filtered = rankings;

    if (options.difficulty && options.difficulty !== 'all') {
      filtered = filtered.filter(r => r.difficulty_level === options.difficulty);
    }

    if (options.gameMode && options.gameMode !== 'all') {
      // Filtro por modo de jogo se disponível
    }

    // Offset para paginação
    if (options.offset) {
      filtered = filtered.slice(options.offset);
    }

    return filtered;
  }

  /**
   * Busca estatísticas globais
   */
  async getGlobalStats(): Promise<GlobalStatsDTO> {
    return await this.rankingRepository.getGlobalStats();
  }

  /**
   * Calcula tier baseado na pontuação
   */
  calculateTier(totalScore: number): string {
    for (let i = this.TIERS.length - 1; i >= 0; i--) {
      if (totalScore >= this.TIERS[i].minScore) {
        return this.TIERS[i].name;
      }
    }
    return this.TIERS[0].name;
  }

  /**
   * Calcula progresso para próximo tier
   */
  calculateNextTierProgress(totalScore: number): number {
    for (let i = 0; i < this.TIERS.length - 1; i++) {
      if (totalScore >= this.TIERS[i].minScore && totalScore < this.TIERS[i + 1].minScore) {
        const current = totalScore - this.TIERS[i].minScore;
        const needed = this.TIERS[i + 1].minScore - this.TIERS[i].minScore;
        return Math.round((current / needed) * 100);
      }
    }
    return 100; // Já está no tier máximo
  }

  /**
   * Retorna informações do tier atual e próximo
   */
  getTierInfo(totalScore: number): {
    current: string;
    next: string | null;
    pointsToNext: number | null;
  } {
    for (let i = 0; i < this.TIERS.length - 1; i++) {
      if (totalScore >= this.TIERS[i].minScore && totalScore < this.TIERS[i + 1].minScore) {
        return {
          current: this.TIERS[i].name,
          next: this.TIERS[i + 1].name,
          pointsToNext: this.TIERS[i + 1].minScore - totalScore
        };
      }
    }
    
    return {
      current: this.TIERS[this.TIERS.length - 1].name,
      next: null,
      pointsToNext: null
    };
  }

  /**
   * Calcula pontos ganhos na partida
   */
  calculateMatchPoints(
    victory: boolean,
    opponentScore: number,
    playerScore: number,
    streak: number
  ): number {
    let basePoints = victory ? 100 : 10;
    
    // Bônus por diferença de pontos
    const scoreDiff = playerScore - opponentScore;
    if (scoreDiff > 0) {
      basePoints += Math.min(scoreDiff * 2, 50);
    }

    // Multiplicador de streak
    const streakMultiplier = 1 + Math.min(streak * 0.1, 0.5);
    
    return Math.round(basePoints * streakMultiplier);
  }

  /**
   * Formata estatísticas para exibição
   */
  formatStats(ranking: RankingEntry): {
    winRate: string;
    avgScore: string;
    gamesPlayed: string;
  } {
    return {
      winRate: `${ranking.win_rate?.toFixed(1) || 0}%`,
      avgScore: ranking.total_games > 0 
        ? Math.round(ranking.total_score / ranking.total_games).toLocaleString()
        : '0',
      gamesPlayed: ranking.total_games.toLocaleString()
    };
  }
}
