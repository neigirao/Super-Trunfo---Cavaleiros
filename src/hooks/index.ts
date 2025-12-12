/**
 * Exports centralizados dos hooks
 */

// Hooks de cards
export {
  useAllCards,
  useUserCards,
  useCard,
  useCardCount,
  useAddCardToCollection,
  useCardCollection,
  useHasMinimumCards,
  cardService,
  CARD_QUERY_KEYS,
} from './useCards';

// Hooks de ranking
export {
  useTopRankings,
  useUserStats,
  useGlobalStats,
  useUpdateStats,
  useRankingData,
  useMatchPointsCalculator,
  rankingService,
  RANKING_QUERY_KEYS,
} from './useRanking';

// Hooks de batalha
export { useBattleState } from './battle/useBattleState';
export { useBattleLogic } from './battle/useBattleLogic';
export { useBattleEffects } from './battle/useBattleEffects';
export { useBattleCards } from './battle/useBattleCards';

// Hooks utilitários
export { useToast, toast } from './use-toast';
export { useIsMobile } from './use-mobile';
export { useOnboarding } from './useOnboarding';
export { useImageUpload } from './useImageUpload';
export { useMinimumCards } from './useMinimumCards';
