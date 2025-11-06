/**
 * Mocks para repositórios
 */
import { vi } from 'vitest';
import type { ICardRepository, IRankingRepository } from '@/domain/interfaces';

export const createMockCardRepository = (): ICardRepository => ({
  findByUserId: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  findByIds: vi.fn().mockResolvedValue([]),
  addToUserCollection: vi.fn().mockResolvedValue(undefined),
  userHasCard: vi.fn().mockResolvedValue(false),
  countUserCards: vi.fn().mockResolvedValue(0),
});

export const createMockRankingRepository = (): IRankingRepository => ({
  findByUserId: vi.fn().mockResolvedValue(null),
  getTopRankings: vi.fn().mockResolvedValue([]),
  updateStats: vi.fn().mockResolvedValue(undefined),
  getUserPosition: vi.fn().mockResolvedValue(null),
  getGlobalStats: vi.fn().mockResolvedValue({
    totalGames: 0,
    totalPlayers: 0,
    averageScore: 0,
  }),
});
