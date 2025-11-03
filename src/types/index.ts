/**
 * @fileoverview Ponto de entrada central para todos os tipos do projeto
 * 
 * Este arquivo reexporta todos os tipos de seus respectivos módulos,
 * permitindo imports simplificados em todo o projeto.
 * 
 * @example
 * ```typescript
 * // Em vez de:
 * import { ElementCard } from '@/types/card.types';
 * import { BattleState } from '@/types/battle.types';
 * 
 * // Você pode fazer:
 * import { ElementCard, BattleState } from '@/types';
 * ```
 * 
 * @module types
 */

// Card Types
export type {
  CardRarity,
  ElementType,
  BattleAttribute,
  ElementCard,
  UserCard,
  PackOpening as CardPackOpening,
  RarityMetadata
} from './card.types';

// Battle Types
export type {
  BattleResult,
  TurnOwner,
  GamePhase,
  BattleState,
  AIConfig,
  GameResult,
  RoundStats,
  UseBattleLogicReturn
} from './battle.types';

// User Types
export type {
  UserProfile,
  CardGameRanking,
  RankingEntry,
  Achievement,
  UserAchievement,
  PlayerLevel,
  UserCustomization,
  UserGameHistory,
  UserDeck
} from './user.types';

// Game Types
export type {
  DailyChallenge,
  UserChallengeProgress,
  LiveEvent,
  LiveStats,
  TutorialStep,
  Tutorial,
  UserTutorialProgress,
  PackOpening,
  AdminNotification
} from './game.types';
