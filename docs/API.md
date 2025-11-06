# 📖 API Documentation - Super Trunfo dos Elementos

Documentação completa da API interna do projeto.

## 📋 Índice

1. [Domain Layer](#domain-layer)
2. [Application Layer](#application-layer)
3. [Infrastructure Layer](#infrastructure-layer)
4. [Hooks](#hooks)
5. [Types](#types)

---

## Domain Layer

### ICardRepository

Interface que define o contrato para repositório de cartas.

```typescript
interface ICardRepository {
  /**
   * Busca todas as cartas disponíveis no jogo
   * @returns Promise com array de cartas
   * @throws RepositoryError se houver erro na busca
   */
  findAll(): Promise<ElementCard[]>;

  /**
   * Busca uma carta específica por ID
   * @param cardId - ID da carta
   * @returns Promise com a carta ou null se não encontrada
   * @throws RepositoryError se houver erro na busca
   */
  findById(cardId: string): Promise<ElementCard | null>;

  /**
   * Busca todas as cartas de um usuário
   * @param userId - ID do usuário
   * @returns Promise com array de cartas do usuário
   * @throws RepositoryError se houver erro na busca
   */
  findByUserId(userId: string): Promise<ElementCard[]>;

  /**
   * Adiciona uma carta à coleção do usuário
   * @param userId - ID do usuário
   * @param cardId - ID da carta a ser adicionada
   * @throws RepositoryError se houver erro ao adicionar
   */
  addCard(userId: string, cardId: string): Promise<void>;
}
```

### IRankingRepository

Interface que define o contrato para repositório de ranking.

```typescript
interface IRankingRepository {
  /**
   * Busca o ranking de um usuário específico
   * @param userId - ID do usuário
   * @returns Promise com o ranking ou null se não encontrado
   * @throws RepositoryError se houver erro na busca
   */
  findByUserId(userId: string): Promise<CardGameRanking | null>;

  /**
   * Atualiza as estatísticas do usuário após uma batalha
   * @param userId - ID do usuário
   * @param victory - Se o usuário venceu (true) ou perdeu (false)
   * @throws RepositoryError se houver erro ao atualizar
   */
  updateStats(userId: string, victory: boolean): Promise<void>;

  /**
   * Busca os melhores rankings do jogo
   * @param limit - Quantidade de rankings a retornar (padrão: 10)
   * @returns Promise com array de rankings ordenados por pontuação
   * @throws RepositoryError se houver erro na busca
   */
  getTopRankings(limit?: number): Promise<CardGameRanking[]>;
}
```

---

## Application Layer

### BattleService

Serviço que orquestra a lógica de batalha do jogo.

```typescript
class BattleService {
  constructor(
    private cardRepository: ICardRepository,
    private rankingRepository: IRankingRepository
  );

  /**
   * Valida se o tamanho do deck é adequado para batalha
   * @param deckSize - Número de cartas no deck
   * @throws Error se o deck tiver menos de 6 cartas
   */
  validateDeckSize(deckSize: number): void;

  /**
   * Cria um deck para o oponente com cartas aleatórias
   * @param size - Tamanho do deck a ser criado
   * @returns Promise com array de cartas do oponente
   * @throws Error se não houver cartas suficientes disponíveis
   */
  createOpponentDeck(size: number): Promise<ElementCard[]>;

  /**
   * Determina o vencedor de uma rodada de batalha
   * @param playerCard - Carta do jogador
   * @param opponentCard - Carta do oponente
   * @param attribute - Atributo sendo comparado
   * @returns Resultado da batalha com valores e vencedor
   */
  determineWinner(
    playerCard: ElementCard,
    opponentCard: ElementCard,
    attribute: BattleAttribute
  ): BattleResult;

  /**
   * Salva o resultado da batalha no ranking
   * @param userId - ID do usuário
   * @param victory - Se o usuário venceu
   * @throws Error se houver erro ao salvar
   */
  saveResult(userId: string, victory: boolean): Promise<void>;
}
```

#### BattleResult

```typescript
interface BattleResult {
  winner: 'player' | 'opponent' | 'draw';
  playerValue: number;
  opponentValue: number;
  attribute: BattleAttribute;
}
```

---

## Infrastructure Layer

### RepositoryFactory

Factory para criar instâncias de repositórios.

```typescript
class RepositoryFactory {
  /**
   * Cria uma instância de ICardRepository
   * @param client - Cliente Supabase
   * @returns Instância de SupabaseCardRepository
   */
  static createCardRepository(client: SupabaseClient): ICardRepository;

  /**
   * Cria uma instância de IRankingRepository
   * @param client - Cliente Supabase
   * @returns Instância de SupabaseRankingRepository
   */
  static createRankingRepository(client: SupabaseClient): IRankingRepository;
}
```

### SupabaseCardRepository

Implementação concreta de ICardRepository usando Supabase.

```typescript
class SupabaseCardRepository implements ICardRepository {
  constructor(private supabaseClient: SupabaseClient);

  // Implementa todos os métodos de ICardRepository
}
```

### SupabaseRankingRepository

Implementação concreta de IRankingRepository usando Supabase.

```typescript
class SupabaseRankingRepository implements IRankingRepository {
  constructor(private supabaseClient: SupabaseClient);

  // Implementa todos os métodos de IRankingRepository
}
```

---

## Hooks

### useBattleOrchestrator

Hook principal que orquestra toda a lógica de batalha.

```typescript
interface UseBattleOrchestratorReturn {
  // Estado da batalha
  battleState: BattleState | null;
  isLoading: boolean;
  error: string | null;

  // Ações
  startBattle: (selectedCards: ElementCard[]) => Promise<void>;
  selectAttribute: (attribute: BattleAttribute) => void;
  resetBattle: () => void;

  // Estado da UI
  currentPhase: GamePhase;
  showVictory: boolean;
  isThinking: boolean;
}

/**
 * Hook que orquestra toda a lógica de batalha
 * @param userId - ID do usuário (opcional)
 * @returns Objeto com estado e ações da batalha
 */
function useBattleOrchestrator(
  userId?: string
): UseBattleOrchestratorReturn;
```

### useBattleLogic

Hook que gerencia a lógica central da batalha.

```typescript
interface UseBattleLogicReturn {
  // Estado do jogo
  playerDeck: ElementCard[];
  opponentDeck: ElementCard[];
  playerCard: ElementCard | null;
  opponentCard: ElementCard | null;
  playerScore: number;
  opponentScore: number;
  round: number;
  discardPile: ElementCard[];

  // Ações
  startGame: (
    playerCards: ElementCard[],
    opponentCards: ElementCard[]
  ) => void;
  selectAttribute: (attribute: BattleAttribute) => void;
  nextRound: () => void;

  // Estado do jogo
  gameOver: boolean;
  winner: 'player' | 'opponent' | null;
  battleResult: BattleResult | null;
}

/**
 * Hook que implementa as regras do Super Trunfo
 * @returns Objeto com estado e ações da lógica de batalha
 */
function useBattleLogic(): UseBattleLogicReturn;
```

### useBattleState

Hook que gerencia o estado da UI durante a batalha.

```typescript
interface UseBattleStateReturn {
  currentPhase: GamePhase;
  isPlayerTurn: boolean;
  isThinking: boolean;
  showVictory: boolean;

  setPhase: (phase: GamePhase) => void;
  setPlayerTurn: (isTurn: boolean) => void;
  setThinking: (thinking: boolean) => void;
  setShowVictory: (show: boolean) => void;
}

/**
 * Hook que gerencia as fases e estados da UI da batalha
 * @returns Objeto com estado e setters da UI
 */
function useBattleState(): UseBattleStateReturn;
```

### useBattleEffects

Hook que gerencia efeitos visuais e sonoros.

```typescript
interface UseBattleEffectsReturn {
  playCardSound: () => void;
  playVictorySound: () => void;
  playDefeatSound: () => void;
  showParticles: boolean;
  triggerParticles: () => void;
}

/**
 * Hook que gerencia efeitos visuais e sonoros da batalha
 * @returns Objeto com funções e estados de efeitos
 */
function useBattleEffects(): UseBattleEffectsReturn;
```

### useBattleCards

Hook para carregar cartas do usuário.

```typescript
interface UseBattleCardsReturn {
  cards: ElementCard[];
  isLoading: boolean;
  error: string | null;
  reloadCards: () => Promise<void>;
}

/**
 * Hook que carrega as cartas do usuário
 * @param userId - ID do usuário
 * @returns Objeto com cartas, loading e error states
 */
function useBattleCards(userId?: string): UseBattleCardsReturn;
```

---

## Types

### ElementCard

Tipo principal que representa uma carta do jogo.

```typescript
interface ElementCard {
  id: string;
  name: string;
  symbol: string;
  atomic_number: number;
  atomic_mass: number;
  density: number;
  melting_point: number;
  reactivity: number;
  radioactivity: number;
  knight_name: string;
  special_ability: string;
  rarity: CardRarity;
  element_type: ElementType;
  is_super_trump: boolean;
  image_url?: string;
}
```

### BattleAttribute

Atributos que podem ser comparados em batalha.

```typescript
type BattleAttribute =
  | 'atomic_number'
  | 'atomic_mass'
  | 'density'
  | 'melting_point'
  | 'reactivity'
  | 'radioactivity';
```

### CardRarity

Níveis de raridade das cartas.

```typescript
type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
```

### BattleState

Estado completo de uma batalha.

```typescript
interface BattleState {
  playerDeck: ElementCard[];
  opponentDeck: ElementCard[];
  playerCard: ElementCard | null;
  opponentCard: ElementCard | null;
  selectedAttribute: BattleAttribute | null;
  battleResult: BattleResult | null;
  playerScore: number;
  opponentScore: number;
  round: number;
  discardPile: ElementCard[];
}
```

### GamePhase

Fases do jogo durante uma batalha.

```typescript
type GamePhase =
  | 'setup'        // Configuração inicial
  | 'selection'    // Seleção de atributo
  | 'reveal'       // Revelação das cartas
  | 'result'       // Resultado da rodada
  | 'gameOver';    // Fim do jogo
```

### CardGameRanking

Estatísticas de ranking do jogador.

```typescript
interface CardGameRanking {
  id: string;
  user_id: string;
  player_name: string;
  total_score: number;
  games_won: number;
  games_lost: number;
  win_rate: number;
  favorite_element_type?: string;
  last_played_at?: string;
}
```

---

## Error Handling

### RepositoryError

Erro customizado para operações de repositório.

```typescript
class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
```

### Exemplo de Tratamento

```typescript
try {
  const cards = await cardRepository.findByUserId(userId);
} catch (error) {
  if (error instanceof RepositoryError) {
    console.error('Repository error:', error.message);
    console.error('Original error:', error.originalError);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Constants

### Configurações de Batalha

```typescript
// Tamanho mínimo do deck
export const MIN_DECK_SIZE = 6;

// Pontos por vitória
export const POINTS_PER_WIN = 100;

// Delay entre fases (ms)
export const PHASE_DELAY = 1000;
```

---

## Utilities

### Funções Auxiliares

```typescript
/**
 * Embaralha um array de forma aleatória
 */
function shuffleArray<T>(array: T[]): T[];

/**
 * Seleciona N elementos aleatórios de um array
 */
function selectRandom<T>(array: T[], count: number): T[];

/**
 * Calcula o valor de um atributo de uma carta
 */
function getAttributeValue(
  card: ElementCard,
  attribute: BattleAttribute
): number;
```

---

Para mais informações:
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Arquitetura completa
- [EXAMPLES.md](./EXAMPLES.md) - Exemplos de uso
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição
