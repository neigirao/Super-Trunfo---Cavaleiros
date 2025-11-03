# Domain Layer (Camada de Domínio)

Esta camada contém a **lógica de negócio pura** da aplicação, independente de frameworks e bibliotecas externas.

## Estrutura

```
domain/
├── entities/          # Entidades do domínio
├── interfaces/        # Contratos de repositórios
├── value-objects/     # Objetos de valor
└── services/         # Serviços de domínio
```

## Princípios

1. **Independência**: Não depende de frameworks externos
2. **Pureza**: Funções puras sempre que possível
3. **Regras de Negócio**: Toda lógica de negócio deve estar aqui
4. **Testabilidade**: Fácil de testar sem mocks complexos

## Exemplo: Entidade

```typescript
/**
 * Entidade de carta do jogo
 * Representa uma carta com suas propriedades e comportamentos
 */
export class CardEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly atomicNumber: number,
    public readonly rarity: CardRarity
  ) {}

  /**
   * Calcula o poder total da carta
   */
  calculatePower(): number {
    return this.atomicNumber * this.getRarityMultiplier();
  }

  /**
   * Verifica se a carta é Super Trunfo
   */
  isSuperTrump(): boolean {
    return this.rarity === 'legendary';
  }

  private getRarityMultiplier(): number {
    const multipliers = {
      common: 1,
      rare: 1.5,
      epic: 2,
      legendary: 3
    };
    return multipliers[this.rarity];
  }
}
```

## Exemplo: Interface de Repositório

```typescript
/**
 * Contrato para repositório de cartas
 * Define operações sem especificar implementação
 */
export interface ICardRepository {
  /**
   * Busca todas as cartas do usuário
   */
  findByUserId(userId: string): Promise<CardEntity[]>;

  /**
   * Busca uma carta específica
   */
  findById(cardId: string): Promise<CardEntity | null>;

  /**
   * Salva uma nova carta para o usuário
   */
  save(userId: string, card: CardEntity): Promise<void>;
}
```

## Quando usar Domain Services

Use serviços de domínio quando:
- A lógica envolve múltiplas entidades
- A operação não pertence naturalmente a uma entidade específica
- Precisa coordenar regras de negócio complexas

```typescript
export class BattleService {
  /**
   * Determina o vencedor de uma batalha
   */
  determineWinner(
    playerCard: CardEntity,
    opponentCard: CardEntity,
    attribute: BattleAttribute
  ): BattleResult {
    // Lógica de negócio pura
  }
}
```

## Benefícios

✅ **Testabilidade**: Fácil de testar
✅ **Manutenibilidade**: Lógica centralizada
✅ **Reusabilidade**: Pode ser usada em qualquer contexto
✅ **Clareza**: Regras de negócio explícitas
