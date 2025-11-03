/**
 * Implementação do repositório de cartas usando Supabase
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { ICardRepository } from '@/domain/interfaces';
import type { ElementCard } from '@/types';

/**
 * Erro customizado para operações de repositório
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Repositório de cartas usando Supabase
 */
export class SupabaseCardRepository implements ICardRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  /**
   * Busca todas as cartas do usuário
   */
  async findByUserId(userId: string): Promise<ElementCard[]> {
    const { data, error } = await this.supabaseClient
      .from('user_cards')
      .select(`
        card_id,
        quantity,
        element_cards (*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new RepositoryError('Falha ao buscar cartas do usuário', error);
    }

    return data?.map((item: any) => item.element_cards as ElementCard).filter(Boolean) || [];
  }

  /**
   * Busca cartas específicas por IDs
   */
  async findByIds(cardIds: string[]): Promise<ElementCard[]> {
    const { data, error } = await this.supabaseClient
      .from('element_cards')
      .select('*')
      .in('id', cardIds);

    if (error) {
      throw new RepositoryError('Falha ao buscar cartas por IDs', error);
    }

    return data || [];
  }

  /**
   * Busca uma carta específica por ID
   */
  async findById(cardId: string): Promise<ElementCard | null> {
    const { data, error } = await this.supabaseClient
      .from('element_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new RepositoryError('Falha ao buscar carta', error);
    }

    return data;
  }

  /**
   * Busca todas as cartas disponíveis
   */
  async findAll(): Promise<ElementCard[]> {
    const { data, error } = await this.supabaseClient
      .from('element_cards')
      .select('*')
      .order('atomic_number');

    if (error) {
      throw new RepositoryError('Falha ao buscar todas as cartas', error);
    }

    return data || [];
  }

  /**
   * Adiciona carta à coleção do usuário
   */
  async addToUserCollection(
    userId: string,
    cardId: string,
    quantity: number = 1
  ): Promise<void> {
    // Verifica se usuário já tem a carta
    const { data: existing } = await this.supabaseClient
      .from('user_cards')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();

    if (existing) {
      // Incrementa quantidade
      const { error } = await this.supabaseClient
        .from('user_cards')
        .update({ quantity: existing.quantity + quantity })
        .eq('user_id', userId)
        .eq('card_id', cardId);

      if (error) {
        throw new RepositoryError('Falha ao atualizar quantidade da carta', error);
      }
    } else {
      // Insere nova carta
      const { error } = await this.supabaseClient
        .from('user_cards')
        .insert({
          user_id: userId,
          card_id: cardId,
          quantity
        });

      if (error) {
        throw new RepositoryError('Falha ao adicionar carta à coleção', error);
      }
    }
  }

  /**
   * Verifica se usuário possui carta
   */
  async userHasCard(userId: string, cardId: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient
      .from('user_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new RepositoryError('Falha ao verificar posse da carta', error);
    }

    return !!data;
  }

  /**
   * Conta cartas do usuário
   */
  async countUserCards(userId: string): Promise<number> {
    const { count, error } = await this.supabaseClient
      .from('user_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new RepositoryError('Falha ao contar cartas do usuário', error);
    }

    return count || 0;
  }
}
