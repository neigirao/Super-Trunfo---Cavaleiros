/**
 * Serviço de aplicação para batalhas
 * Orquestra a lógica de batalha entre camadas
 */

import type { ICardRepository, IRankingRepository } from '@/domain/interfaces';
import type { ElementCard } from '@/types';

/**
 * DTO para estado da batalha
 */
export interface BattleStateDTO {
  playerDeck: ElementCard[];
  opponentDeck: ElementCard[];
  playerCard: ElementCard | null;
  opponentCard: ElementCard | null;
  playerScore: number;
  opponentScore: number;
  round: number;
}

/**
 * Serviço de batalha
 * Coordena operações de batalha entre domínio e infraestrutura
 */
export class BattleService {
  constructor(
    private cardRepository: ICardRepository,
    private rankingRepository: IRankingRepository
  ) {}

  /**
   * Valida se o baralho tem o mínimo de cartas necessário
   * @param deckSize - Tamanho do baralho
   * @returns true se válido
   * @throws Error se inválido
   */
  validateDeckSize(deckSize: number): boolean {
    const MINIMUM_CARDS = 6;
    if (deckSize < MINIMUM_CARDS) {
      throw new Error(`Baralho precisa ter no mínimo ${MINIMUM_CARDS} cartas`);
    }
    return true;
  }

  /**
   * Carrega cartas do usuário para batalha
   * @param userId - ID do usuário
   * @returns Promise com cartas do usuário
   */
  async loadUserCards(userId: string): Promise<ElementCard[]> {
    return await this.cardRepository.findByUserId(userId);
  }

  /**
   * Cria baralho do oponente
   * @param deckSize - Tamanho do baralho desejado
   * @returns Promise com baralho do oponente
   */
  async createOpponentDeck(deckSize: number): Promise<ElementCard[]> {
    const allCards = await this.cardRepository.findAll();
    const opponentDeck: ElementCard[] = [];
    
    for (let i = 0; i < deckSize; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      opponentDeck.push(allCards[randomIndex]);
    }
    
    return opponentDeck;
  }

  /**
   * Calcula poder total de uma carta
   * @param card - Carta para calcular
   * @returns Poder total da carta
   */
  calculateCardPower(card: ElementCard): number {
    return Math.round(
      card.atomic_number + 
      card.atomic_mass + 
      (card.density || 0) + 
      (card.reactivity || 0) + 
      (card.radioactivity || 0)
    );
  }

  /**
   * Finaliza batalha e salva resultado
   * @param userId - ID do usuário
   * @param userEmail - Email do usuário
   * @param victory - Se foi vitória
   * @param score - Pontuação final
   */
  async finishBattle(
    userId: string,
    userEmail: string | undefined,
    victory: boolean,
    score: number
  ): Promise<void> {
    await this.rankingRepository.updateStats(userId, userEmail, {
      victory,
      score
    });
  }

  /**
   * Embaralha um array (algoritmo Fisher-Yates)
   * @param array - Array para embaralhar
   * @returns Array embaralhado
   */
  shuffleDeck<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
