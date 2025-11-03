/**
 * Factory para criação de repositórios
 * Centraliza a criação de instâncias de repositórios
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { ICardRepository, IRankingRepository } from '@/domain/interfaces';
import { SupabaseCardRepository } from './SupabaseCardRepository';
import { SupabaseRankingRepository } from './SupabaseRankingRepository';

/**
 * Factory de repositórios
 * Facilita criação e troca de implementações
 * 
 * @example
 * ```typescript
 * const cardRepo = RepositoryFactory.createCardRepository(supabase);
 * const cards = await cardRepo.findByUserId(userId);
 * ```
 */
export class RepositoryFactory {
  /**
   * Cria repositório de cartas
   */
  static createCardRepository(client: SupabaseClient): ICardRepository {
    return new SupabaseCardRepository(client);
  }

  /**
   * Cria repositório de ranking
   */
  static createRankingRepository(client: SupabaseClient): IRankingRepository {
    return new SupabaseRankingRepository(client);
  }

  /**
   * Cria todos os repositórios de uma vez
   */
  static createAll(client: SupabaseClient) {
    return {
      cardRepository: this.createCardRepository(client),
      rankingRepository: this.createRankingRepository(client)
    };
  }
}
