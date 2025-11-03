/**
 * Interface do repositório de cartas
 * Define o contrato para operações de persistência de cartas
 */

import type { ElementCard } from '@/types';

/**
 * Contrato para repositório de cartas
 */
export interface ICardRepository {
  /**
   * Busca todas as cartas do usuário
   * @param userId - ID do usuário
   * @returns Promise com array de cartas
   */
  findByUserId(userId: string): Promise<ElementCard[]>;

  /**
   * Busca cartas específicas por IDs
   * @param cardIds - Array de IDs das cartas
   * @returns Promise com array de cartas encontradas
   */
  findByIds(cardIds: string[]): Promise<ElementCard[]>;

  /**
   * Busca uma carta específica por ID
   * @param cardId - ID da carta
   * @returns Promise com a carta ou null se não encontrada
   */
  findById(cardId: string): Promise<ElementCard | null>;

  /**
   * Busca todas as cartas disponíveis no jogo
   * @returns Promise com array de todas as cartas
   */
  findAll(): Promise<ElementCard[]>;

  /**
   * Adiciona uma carta à coleção do usuário
   * @param userId - ID do usuário
   * @param cardId - ID da carta
   * @param quantity - Quantidade a adicionar (padrão: 1)
   */
  addToUserCollection(
    userId: string,
    cardId: string,
    quantity?: number
  ): Promise<void>;

  /**
   * Verifica se o usuário possui uma carta específica
   * @param userId - ID do usuário
   * @param cardId - ID da carta
   * @returns Promise com boolean indicando se possui
   */
  userHasCard(userId: string, cardId: string): Promise<boolean>;

  /**
   * Conta o número de cartas do usuário
   * @param userId - ID do usuário
   * @returns Promise com o número de cartas
   */
  countUserCards(userId: string): Promise<number>;
}
