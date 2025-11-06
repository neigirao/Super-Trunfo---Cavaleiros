/**
 * Testes para RepositoryFactory
 */
import { describe, it, expect, vi } from 'vitest';
import { RepositoryFactory } from '../RepositoryFactory';
import { SupabaseCardRepository } from '../SupabaseCardRepository';
import { SupabaseRankingRepository } from '../SupabaseRankingRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('RepositoryFactory', () => {
  const mockSupabase = {} as unknown as SupabaseClient;

  describe('createCardRepository', () => {
    it('should create a SupabaseCardRepository instance', () => {
      const repository = RepositoryFactory.createCardRepository(mockSupabase);

      expect(repository).toBeInstanceOf(SupabaseCardRepository);
    });
  });

  describe('createRankingRepository', () => {
    it('should create a SupabaseRankingRepository instance', () => {
      const repository = RepositoryFactory.createRankingRepository(mockSupabase);

      expect(repository).toBeInstanceOf(SupabaseRankingRepository);
    });
  });

  describe('createAll', () => {
    it('should create all repositories at once', () => {
      const repositories = RepositoryFactory.createAll(mockSupabase);

      expect(repositories.cardRepository).toBeInstanceOf(SupabaseCardRepository);
      expect(repositories.rankingRepository).toBeInstanceOf(SupabaseRankingRepository);
    });

    it('should return object with correct keys', () => {
      const repositories = RepositoryFactory.createAll(mockSupabase);

      expect(repositories).toHaveProperty('cardRepository');
      expect(repositories).toHaveProperty('rankingRepository');
    });
  });
});
