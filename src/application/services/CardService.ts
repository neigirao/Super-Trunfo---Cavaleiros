/**
 * Serviço de aplicação para cartas
 * Orquestra operações de cartas entre camadas
 */

import type { ICardRepository } from '@/domain/interfaces';
import type { ElementCard } from '@/types';

/**
 * Estatísticas da coleção do usuário
 */
export interface CollectionStatsDTO {
  totalCards: number;
  uniqueCards: number;
  byRarity: Record<string, number>;
  byElement: Record<string, number>;
  completionPercentage: number;
}

/**
 * Opções de filtro para cartas
 */
export interface CardFilterOptions {
  search?: string;
  rarity?: string;
  elementType?: string;
  sortBy?: 'name' | 'atomic_number' | 'rarity' | 'power';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Serviço de cartas
 * Coordena operações de cartas entre domínio e infraestrutura
 */
export class CardService {
  constructor(private cardRepository: ICardRepository) {}

  /**
   * Busca cartas do usuário com cache
   */
  async getUserCards(userId: string): Promise<ElementCard[]> {
    return await this.cardRepository.findByUserId(userId);
  }

  /**
   * Busca todas as cartas disponíveis
   */
  async getAllCards(): Promise<ElementCard[]> {
    return await this.cardRepository.findAll();
  }

  /**
   * Busca carta por ID
   */
  async getCardById(cardId: string): Promise<ElementCard | null> {
    return await this.cardRepository.findById(cardId);
  }

  /**
   * Adiciona carta à coleção do usuário
   */
  async addCardToCollection(
    userId: string,
    cardId: string,
    quantity: number = 1
  ): Promise<void> {
    await this.cardRepository.addToUserCollection(userId, cardId, quantity);
  }

  /**
   * Verifica se usuário possui carta
   */
  async userHasCard(userId: string, cardId: string): Promise<boolean> {
    return await this.cardRepository.userHasCard(userId, cardId);
  }

  /**
   * Conta cartas do usuário
   */
  async countUserCards(userId: string): Promise<number> {
    return await this.cardRepository.countUserCards(userId);
  }

  /**
   * Calcula estatísticas da coleção
   */
  calculateCollectionStats(
    userCards: ElementCard[],
    allCards: ElementCard[]
  ): CollectionStatsDTO {
    const byRarity: Record<string, number> = {};
    const byElement: Record<string, number> = {};

    userCards.forEach(card => {
      byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1;
      byElement[card.element_type] = (byElement[card.element_type] || 0) + 1;
    });

    const uniqueCardIds = new Set(userCards.map(c => c.id));

    return {
      totalCards: userCards.length,
      uniqueCards: uniqueCardIds.size,
      byRarity,
      byElement,
      completionPercentage: allCards.length > 0 
        ? Math.round((uniqueCardIds.size / allCards.length) * 100)
        : 0
    };
  }

  /**
   * Filtra e ordena cartas
   */
  filterCards(cards: ElementCard[], options: CardFilterOptions): ElementCard[] {
    let filtered = [...cards];

    // Filtro por busca
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.symbol.toLowerCase().includes(searchLower) ||
        card.knight_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por raridade
    if (options.rarity && options.rarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === options.rarity);
    }

    // Filtro por tipo de elemento
    if (options.elementType && options.elementType !== 'all') {
      filtered = filtered.filter(card => card.element_type === options.elementType);
    }

    // Ordenação
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'atomic_number':
            comparison = a.atomic_number - b.atomic_number;
            break;
          case 'rarity':
            const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
            comparison = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) - 
                        (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0);
            break;
          case 'power':
            comparison = this.calculateCardPower(a) - this.calculateCardPower(b);
            break;
        }

        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  /**
   * Calcula poder total de uma carta
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
   * Agrupa cartas por elemento
   */
  groupByElement(cards: ElementCard[]): Record<string, ElementCard[]> {
    return cards.reduce((acc, card) => {
      if (!acc[card.element_type]) {
        acc[card.element_type] = [];
      }
      acc[card.element_type].push(card);
      return acc;
    }, {} as Record<string, ElementCard[]>);
  }

  /**
   * Agrupa cartas por raridade
   */
  groupByRarity(cards: ElementCard[]): Record<string, ElementCard[]> {
    return cards.reduce((acc, card) => {
      if (!acc[card.rarity]) {
        acc[card.rarity] = [];
      }
      acc[card.rarity].push(card);
      return acc;
    }, {} as Record<string, ElementCard[]>);
  }
}
