# Infrastructure Layer (Camada de Infraestrutura)

Esta camada contém as **implementações concretas** de repositórios e serviços externos.

## Estrutura

```
infrastructure/
├── repositories/     # Implementações de repositórios
├── supabase/        # Adaptadores para Supabase
├── storage/         # Gerenciamento de storage
└── external/        # Serviços externos
```

## Princípios

1. **Implementação**: Implementa interfaces do domínio
2. **Adaptação**: Adapta bibliotecas externas
3. **Persistência**: Gerencia acesso a dados
4. **Isolamento**: Isola detalhes de infraestrutura

## Exemplo: Repositório

```typescript
/**
 * Implementação do repositório de cartas usando Supabase
 */
export class SupabaseCardRepository implements ICardRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  /**
   * Busca cartas do usuário
   */
  async findByUserId(userId: string): Promise<CardEntity[]> {
    const { data, error } = await this.supabaseClient
      .from('user_cards')
      .select(`
        card_id,
        quantity,
        element_cards (*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new RepositoryError('Failed to fetch user cards', error);
    }

    return data?.map(item => this.toEntity(item.element_cards)) || [];
  }

  /**
   * Busca carta por ID
   */
  async findById(cardId: string): Promise<CardEntity | null> {
    const { data, error } = await this.supabaseClient
      .from('element_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new RepositoryError('Failed to fetch card', error);
    }

    return this.toEntity(data);
  }

  /**
   * Salva carta para usuário
   */
  async save(userId: string, card: CardEntity): Promise<void> {
    const { error } = await this.supabaseClient
      .from('user_cards')
      .upsert({
        user_id: userId,
        card_id: card.id,
        quantity: 1
      });

    if (error) {
      throw new RepositoryError('Failed to save card', error);
    }
  }

  /**
   * Converte dados do banco para entidade de domínio
   */
  private toEntity(data: any): CardEntity {
    return new CardEntity(
      data.id,
      data.name,
      data.atomic_number,
      data.rarity as CardRarity
    );
  }
}
```

## Exemplo: Serviço de Ranking

```typescript
/**
 * Repositório de ranking usando Supabase
 */
export class SupabaseRankingRepository implements IRankingRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  /**
   * Atualiza estatísticas do usuário
   */
  async updateStats(
    userId: string,
    victory: boolean
  ): Promise<void> {
    const { data: current } = await this.supabaseClient
      .from('card_game_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    const stats = this.calculateNewStats(current, victory);

    const { error } = await this.supabaseClient
      .from('card_game_rankings')
      .upsert({
        user_id: userId,
        ...stats,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new RepositoryError('Failed to update ranking', error);
    }
  }

  /**
   * Busca top rankings
   */
  async getTopRankings(limit: number = 10): Promise<RankingEntity[]> {
    const { data, error } = await this.supabaseClient
      .from('card_game_rankings')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new RepositoryError('Failed to fetch rankings', error);
    }

    return data?.map(item => this.toEntity(item)) || [];
  }

  private calculateNewStats(current: any, victory: boolean) {
    // Lógica de cálculo
  }

  private toEntity(data: any): RankingEntity {
    // Conversão para entidade
  }
}
```

## Tratamento de Erros

```typescript
/**
 * Erro customizado para repositórios
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
```

## Factory Pattern

```typescript
/**
 * Factory para criar repositórios
 */
export class RepositoryFactory {
  static createCardRepository(
    client: SupabaseClient
  ): ICardRepository {
    return new SupabaseCardRepository(client);
  }

  static createRankingRepository(
    client: SupabaseClient
  ): IRankingRepository {
    return new SupabaseRankingRepository(client);
  }
}
```

## Benefícios

✅ **Substituibilidade**: Fácil trocar implementações
✅ **Testabilidade**: Pode usar mocks em testes
✅ **Manutenibilidade**: Isola detalhes técnicos
✅ **Escalabilidade**: Adiciona novos repositórios facilmente
