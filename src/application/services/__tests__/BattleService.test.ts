/**
 * Testes para BattleService
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BattleService } from '../BattleService';
import type { ICardRepository, IRankingRepository } from '@/domain/interfaces';

describe('BattleService', () => {
  let service: BattleService;
  let mockCardRepo: ICardRepository;
  let mockRankingRepo: IRankingRepository;

  beforeEach(() => {
    mockCardRepo = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    } as any;

    mockRankingRepo = {
      findByUserId: vi.fn(),
      getTopRankings: vi.fn(),
      updateStats: vi.fn(),
    } as any;

    service = new BattleService(mockCardRepo, mockRankingRepo);
  });

  describe('validateDeckSize', () => {
    it('should validate minimum deck size', () => {
      expect(() => service.validateDeckSize(6)).not.toThrow();
      expect(() => service.validateDeckSize(5)).toThrow();
    });
  });

  describe('calculateCardPower', () => {
    it('should calculate card power correctly', () => {
      const card: any = {
        atomic_number: 6,
        atomic_mass: 12,
        density: 2,
        reactivity: 3,
        radioactivity: 0,
      };

      const power = service.calculateCardPower(card);
      expect(power).toBe(23);
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = service.shuffleDeck(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).not.toBe(original);
    });
  });
});
