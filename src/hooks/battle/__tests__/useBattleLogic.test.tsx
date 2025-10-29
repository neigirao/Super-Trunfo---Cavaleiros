import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBattleLogic } from '../useBattleLogic';
import type { ElementCard } from '../useBattleLogic';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockCard1: ElementCard = {
  id: '1',
  knight_name: 'Knight 1',
  name: 'Fire',
  symbol: 'F',
  atomic_number: 1,
  atomic_mass: 10,
  melting_point: 100,
  density: 1.5,
  reactivity: 2.0,
  radioactivity: 0.5,
  element_type: 'metal',
  rarity: 'common',
  special_ability: 'Test ability',
  is_super_trump: false,
  image_url: 'test.jpg',
};

const mockCard2: ElementCard = {
  ...mockCard1,
  id: '2',
  knight_name: 'Knight 2',
  atomic_number: 2,
  atomic_mass: 20,
  is_super_trump: false,
};

const mockSuperTrumpCard: ElementCard = {
  ...mockCard1,
  id: '3',
  knight_name: 'Super Knight',
  is_super_trump: true,
};

describe('useBattleLogic', () => {
  const TEST_USER_ID = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startBattle', () => {
    it('should initialize battle with player and opponent decks', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1, mockCard2], [mockCard1, mockCard2]);
      });

      expect(result.current.battle.playerDeck).toHaveLength(2);
      expect(result.current.battle.opponentDeck).toHaveLength(2);
      expect(result.current.battle.playerCard).toBeDefined();
      expect(result.current.battle.opponentCard).toBeDefined();
      expect(result.current.battle.playerScore).toBe(0);
      expect(result.current.battle.opponentScore).toBe(0);
    });

    it('should shuffle decks when starting battle', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));
      const deck = Array.from({ length: 10 }, (_, i) => ({
        ...mockCard1,
        id: `${i}`,
      }));

      act(() => {
        result.current.startBattle(deck, deck);
      });

      expect(result.current.battle.playerDeck.length).toBeGreaterThan(0);
      expect(result.current.battle.opponentDeck.length).toBeGreaterThan(0);
    });
  });

  describe('calculateBattleResult', () => {
    it('should determine winner based on attribute comparison', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1], [mockCard2]);
      });

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      // mockCard2 has higher atomic_mass (20 > 10)
      expect(result.current.battle.battleResult).toBe('lose');
    });

    it('should handle Super Trump victory', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockSuperTrumpCard], [mockCard1]);
      });

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      expect(result.current.battle.battleResult).toBe('win');
    });

    it('should handle draw when values are equal', () => {
      const equalCard: ElementCard = { ...mockCard1, id: '99' };
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1], [equalCard]);
      });

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      expect(result.current.battle.battleResult).toBe('draw');
    });
  });

  describe('nextRound', () => {
    it('should progress to next round after battle', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1, mockCard2], [mockCard1, mockCard2]);
      });

      const initialRound = result.current.battle.round;

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.battle.round).toBe(initialRound + 1);
    });

    it('should update scores after round', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1], [mockCard2]);
      });

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      const initialOpponentScore = result.current.battle.opponentScore;

      act(() => {
        result.current.nextRound();
      });

      // Opponent should win this round (higher atomic_mass)
      expect(result.current.battle.opponentScore).toBeGreaterThan(initialOpponentScore);
    });

    it('should detect game over when deck is empty', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      act(() => {
        result.current.startBattle([mockCard1], [mockCard2]);
      });

      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      let gameOverResult: { gameOver: boolean; winner: 'player' | 'opponent' | null };
      act(() => {
        gameOverResult = result.current.nextRound();
      });

      expect(gameOverResult!.gameOver).toBe(true);
    });
  });

  describe('getOpponentChoice', () => {
    it('should select attribute with highest value', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      const cardWithHighDensity: ElementCard = {
        ...mockCard1,
        atomic_mass: 5,
        melting_point: 10,
        density: 999, // Highest value
        reactivity: 1,
        radioactivity: 0.1,
      };

      act(() => {
        result.current.startBattle([mockCard1], [cardWithHighDensity]);
      });

      const choice = result.current.getOpponentChoice();
      expect(choice).toBe('density');
    });
  });

  describe('game state', () => {
    it('should maintain correct game state throughout battle', () => {
      const { result } = renderHook(() => useBattleLogic(TEST_USER_ID));

      // Initial state
      expect(result.current.battle.round).toBe(1);

      // Start battle
      act(() => {
        result.current.startBattle([mockCard1, mockCard2], [mockCard1, mockCard2]);
      });

      expect(result.current.battle.playerCard).toBeDefined();
      expect(result.current.battle.opponentCard).toBeDefined();

      // Play round
      act(() => {
        result.current.calculateBattleResult('atomic_mass');
      });

      expect(result.current.battle.battleResult).toBeDefined();

      // Next round
      act(() => {
        result.current.nextRound();
      });

      expect(result.current.battle.round).toBe(2);
    });
  });
});
