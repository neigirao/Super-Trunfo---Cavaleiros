# Application Layer (Camada de Aplicação)

Esta camada contém os **casos de uso** e **serviços de aplicação** que orquestram a lógica de domínio.

## Estrutura

```
application/
├── services/         # Serviços de aplicação
├── use-cases/       # Casos de uso específicos
└── dto/            # Data Transfer Objects
```

## Princípios

1. **Orquestração**: Coordena domínio e infraestrutura
2. **Casos de Uso**: Um serviço por caso de uso
3. **DTOs**: Transferência de dados entre camadas
4. **Validação**: Valida entrada antes de passar ao domínio

## Exemplo: Serviço de Aplicação

```typescript
/**
 * Serviço de batalha
 * Orquestra a lógica de batalha entre jogador e oponente
 */
export class BattleApplicationService {
  constructor(
    private cardRepository: ICardRepository,
    private rankingRepository: IRankingRepository,
    private battleDomainService: BattleDomainService
  ) {}

  /**
   * Inicia uma nova batalha
   * 
   * @param userId - ID do usuário
   * @param cardIds - IDs das cartas selecionadas
   * @returns Estado inicial da batalha
   */
  async startBattle(
    userId: string,
    cardIds: string[]
  ): Promise<BattleStateDTO> {
    // 1. Validar entrada
    if (cardIds.length < 6) {
      throw new InvalidDeckSizeError();
    }

    // 2. Buscar cartas do usuário (infraestrutura)
    const userCards = await this.cardRepository.findByIds(cardIds);

    // 3. Criar baralho do oponente (domínio)
    const opponentDeck = this.battleDomainService.createOpponentDeck(
      userCards.length
    );

    // 4. Iniciar batalha (domínio)
    const battle = this.battleDomainService.startBattle(
      userCards,
      opponentDeck
    );

    // 5. Retornar DTO
    return this.toBattleStateDTO(battle);
  }

  /**
   * Processa uma rodada de batalha
   */
  async playRound(
    battleId: string,
    attribute: BattleAttribute
  ): Promise<RoundResultDTO> {
    // Lógica do caso de uso
  }

  /**
   * Finaliza batalha e atualiza ranking
   */
  async finishBattle(
    userId: string,
    battleId: string,
    victory: boolean
  ): Promise<void> {
    // 1. Atualizar ranking (infraestrutura)
    await this.rankingRepository.updateStats(userId, victory);

    // 2. Salvar histórico (infraestrutura)
    // 3. Conceder recompensas (domínio)
  }

  private toBattleStateDTO(battle: Battle): BattleStateDTO {
    // Conversão de entidade para DTO
  }
}
```

## Exemplo: DTO

```typescript
/**
 * DTO para transferir estado da batalha
 */
export interface BattleStateDTO {
  playerCard: {
    id: string;
    name: string;
    attributes: Record<string, number>;
  };
  opponentCard: {
    id: string;
    name: string;
    attributes: Record<string, number>;
  };
  playerScore: number;
  opponentScore: number;
  round: number;
}
```

## Fluxo de Dados

```
Presentation → Application → Domain
     ↓              ↓           ↓
   DTO    →    Use Case  →  Entities
                  ↓
           Infrastructure
```

## Quando usar Application Services

Use serviços de aplicação quando:
- Precisa orquestrar múltiplos repositórios
- O fluxo envolve várias etapas
- Precisa coordenar domínio e infraestrutura
- Tem validações complexas de entrada

## Benefícios

✅ **Separação de Responsabilidades**: Orquestração clara
✅ **Testabilidade**: Fácil de mockar dependências
✅ **Reusabilidade**: Casos de uso reutilizáveis
✅ **Manutenibilidade**: Fluxo de negócio explícito
