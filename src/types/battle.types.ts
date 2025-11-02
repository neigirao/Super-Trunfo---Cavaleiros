/**
 * @fileoverview Tipos relacionados ao sistema de batalha do Super Trunfo
 * 
 * Define todos os tipos, interfaces e enums usados na lógica de batalha,
 * incluindo estado da batalha, resultados, e configurações de rodadas.
 * 
 * @module types/battle
 */

import type { ElementCard, BattleAttribute } from './card.types';

/**
 * Resultado possível de uma rodada de batalha
 * - win: Jogador venceu a rodada
 * - lose: Oponente venceu a rodada
 * - draw: Empate (cartas vão para pilha de descarte)
 */
export type BattleResult = 'win' | 'lose' | 'draw';

/**
 * Quem está escolhendo o atributo na rodada atual
 * - player: O jogador humano escolhe
 * - opponent: A IA escolhe automaticamente
 */
export type TurnOwner = 'player' | 'opponent';

/**
 * Fases do jogo
 * - deckBuilder: Montagem do baralho
 * - battle: Batalha em andamento
 * - result: Tela de resultado da rodada
 * - gameOver: Fim do jogo
 */
export type GamePhase = 'deckBuilder' | 'battle' | 'result' | 'gameOver';

/**
 * Estado completo de uma batalha em andamento
 * 
 * Esta interface representa todo o estado necessário para gerenciar
 * uma partida de Super Trunfo, incluindo baralhos, cartas em jogo,
 * pontuações e informações da rodada.
 * 
 * @interface BattleState
 * 
 * @example
 * ```typescript
 * const initialBattle: BattleState = {
 *   playerDeck: [...playerCards],
 *   opponentDeck: [...opponentCards],
 *   playerCard: playerCards[0],
 *   opponentCard: opponentCards[0],
 *   selectedAttribute: null,
 *   battleResult: null,
 *   playerScore: 0,
 *   opponentScore: 0,
 *   round: 1,
 *   discardPile: []
 * };
 * ```
 */
export interface BattleState {
  /** Baralho restante do jogador (sem incluir a carta atual) */
  playerDeck: ElementCard[];
  
  /** Baralho restante do oponente (sem incluir a carta atual) */
  opponentDeck: ElementCard[];
  
  /** Carta atual em jogo do jogador */
  playerCard: ElementCard | null;
  
  /** Carta atual em jogo do oponente */
  opponentCard: ElementCard | null;
  
  /** Atributo selecionado para comparação (null se ainda não foi escolhido) */
  selectedAttribute: BattleAttribute | null;
  
  /** Resultado da rodada atual (null se ainda não foi calculado) */
  battleResult: BattleResult | null;
  
  /** Número de rodadas vencidas pelo jogador */
  playerScore: number;
  
  /** Número de rodadas vencidas pelo oponente */
  opponentScore: number;
  
  /** Número da rodada atual (começa em 1) */
  round: number;
  
  /** 
   * Pilha de cartas em jogo durante empates consecutivos
   * Quando alguém vence, leva todas as cartas da pilha
   */
  discardPile: ElementCard[];
}

/**
 * Configurações de dificuldade da IA
 */
export interface AIConfig {
  /** Nome do nível de dificuldade */
  name: string;
  
  /** 
   * Chance (0-1) da IA escolher o melhor atributo
   * 1.0 = sempre escolhe o melhor
   * 0.5 = 50% de chance de escolher aleatório
   */
  accuracyRate: number;
  
  /** Tempo de delay antes da IA fazer sua escolha (ms) */
  thinkingTime: number;
  
  /** 
   * Se true, a IA pode "prever" cartas futuras e escolher estrategicamente
   * Aumenta significativamente a dificuldade
   */
  canPredict: boolean;
}

/**
 * Resultado final de uma partida
 */
export interface GameResult {
  /** Se o jogador venceu a partida */
  isVictory: boolean;
  
  /** Pontuação final do jogador */
  playerScore: number;
  
  /** Pontuação final do oponente */
  opponentScore: number;
  
  /** Total de rodadas jogadas */
  totalRounds: number;
  
  /** Duração da partida em segundos */
  duration: number;
  
  /** Pontos de experiência ganhos */
  experienceGained: number;
  
  /** Nome do baralho usado (se foi um baralho salvo) */
  deckName?: string;
}

/**
 * Estatísticas de uma rodada individual
 * Usado para análise e replay
 */
export interface RoundStats {
  /** Número da rodada */
  roundNumber: number;
  
  /** Carta jogada pelo jogador */
  playerCard: ElementCard;
  
  /** Carta jogada pelo oponente */
  opponentCard: ElementCard;
  
  /** Atributo usado na comparação */
  attribute: BattleAttribute;
  
  /** Valor do atributo na carta do jogador */
  playerValue: number;
  
  /** Valor do atributo na carta do oponente */
  opponentValue: number;
  
  /** Resultado da rodada */
  result: BattleResult;
  
  /** Quem escolheu o atributo */
  chosenBy: TurnOwner;
  
  /** Duração da rodada em segundos */
  duration: number;
}

/**
 * Props do hook useBattleLogic
 */
export interface UseBattleLogicReturn {
  /** Estado atual da batalha */
  battle: BattleState;
  
  /** De quem é a vez de escolher */
  whoChooses: TurnOwner;
  
  /** Número inicial de cartas do jogador (para progresso) */
  initialPlayerCards: number;
  
  /** Número inicial de cartas do oponente (para progresso) */
  initialOpponentCards: number;
  
  /** Inicia uma nova batalha */
  startBattle: (playerCards: ElementCard[], opponentCards: ElementCard[]) => void;
  
  /** Calcula resultado da rodada baseado no atributo */
  calculateBattleResult: (attribute: BattleAttribute) => BattleResult | null;
  
  /** Avança para próxima rodada */
  nextRound: () => { gameOver: boolean; winner: TurnOwner | null };
  
  /** Retorna a escolha automática da IA */
  getOpponentChoice: () => BattleAttribute;
  
  /** Salva resultado da partida no banco */
  saveGameResult: (isVictory: boolean, userEmail?: string) => Promise<void>;
  
  /** Setter para quem escolhe */
  setWhoChooses: (who: TurnOwner) => void;
  
  /** Setter do estado da batalha */
  setBattle: React.Dispatch<React.SetStateAction<BattleState>>;
}
