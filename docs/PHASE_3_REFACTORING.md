# Fase 3: Refatoração de Código - Documentação

## Visão Geral

A Fase 3 implementou uma camada de serviços robusta, hooks otimizados com React Query, e melhorias de performance através de code splitting e memoization.

## Arquitetura Implementada

```
src/
├── application/
│   └── services/
│       ├── BattleService.ts    # Orquestra lógica de batalha
│       ├── CardService.ts      # NEW: Gerencia operações de cartas
│       ├── RankingService.ts   # NEW: Gerencia operações de ranking
│       └── index.ts            # Exports centralizados
├── domain/
│   └── interfaces/
│       ├── ICardRepository.ts     # Contrato para repositório de cartas
│       └── IRankingRepository.ts  # Contrato para repositório de ranking
├── infrastructure/
│   └── repositories/
│       ├── SupabaseCardRepository.ts    # Implementação Supabase
│       └── SupabaseRankingRepository.ts # Implementação Supabase
└── hooks/
    ├── useCards.tsx      # NEW: Hooks otimizados para cartas
    ├── useRanking.tsx    # NEW: Hooks otimizados para ranking
    └── index.ts          # NEW: Exports centralizados
```

## Serviços Criados

### CardService

Responsável por todas as operações relacionadas a cartas:

```typescript
// Funcionalidades principais
- getUserCards(userId): Busca cartas do usuário
- getAllCards(): Busca todas as cartas
- getCardById(cardId): Busca carta específica
- addCardToCollection(userId, cardId, quantity): Adiciona carta
- calculateCollectionStats(userCards, allCards): Estatísticas
- filterCards(cards, options): Filtragem com busca, raridade, elemento
- calculateCardPower(card): Calcula poder total
- groupByElement(cards): Agrupa por elemento
- groupByRarity(cards): Agrupa por raridade
```

### RankingService

Responsável por todas as operações de ranking e estatísticas:

```typescript
// Funcionalidades principais
- updateStats(userId, userEmail, data): Atualiza estatísticas
- getUserStats(userId): Estatísticas completas do usuário
- getTopRankings(options): Top rankings com filtros
- getGlobalStats(): Estatísticas globais
- calculateTier(totalScore): Calcula tier (Bronze → Lenda)
- calculateNextTierProgress(score): Progresso para próximo tier
- getTierInfo(score): Informações do tier atual e próximo
- calculateMatchPoints(...): Pontos ganhos na partida
- formatStats(ranking): Formata estatísticas para exibição
```

## Hooks Otimizados

### useCards.tsx

```typescript
// Hooks disponíveis
useAllCards()              // Todas as cartas do jogo
useUserCards()             // Cartas do usuário logado
useCard(cardId)            // Carta específica
useCardCount()             // Contagem de cartas
useAddCardToCollection()   // Mutation para adicionar carta
useCardCollection(filters) // Hook completo com filtros e stats
useHasMinimumCards(min)    // Verifica cartas mínimas

// Query Keys para invalidação
CARD_QUERY_KEYS.all
CARD_QUERY_KEYS.allCards()
CARD_QUERY_KEYS.userCards(userId)
CARD_QUERY_KEYS.card(id)
CARD_QUERY_KEYS.count(userId)
```

### useRanking.tsx

```typescript
// Hooks disponíveis
useTopRankings(options)       // Top rankings com filtros
useUserStats()                // Estatísticas do usuário
useGlobalStats()              // Estatísticas globais
useUpdateStats()              // Mutation para atualizar stats
useRankingData(filters)       // Hook completo com filtros
useMatchPointsCalculator()    // Calculador de pontos

// Query Keys para invalidação
RANKING_QUERY_KEYS.all
RANKING_QUERY_KEYS.list(filters)
RANKING_QUERY_KEYS.user(userId)
RANKING_QUERY_KEYS.stats()
```

## Otimizações de Performance

### 1. Code Splitting (Já implementado em App.tsx)

```typescript
// Lazy loading de páginas
const Index = lazy(() => import("./pages/Index"));
const Game = lazy(() => import("./pages/Game"));
// ... todas as páginas são carregadas sob demanda
```

### 2. React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minuto
      gcTime: 5 * 60 * 1000,     // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. Memoization nos Hooks

```typescript
// Exemplo de memoização em useCardCollection
const filteredUserCards = useMemo(() => {
  return cardService.filterCards(userCards, filterOptions);
}, [userCards, filterOptions]);

const stats = useMemo<CollectionStatsDTO>(() => {
  return cardService.calculateCollectionStats(userCards, allCards);
}, [userCards, allCards]);
```

### 4. Cache Times por Tipo de Dado

| Tipo de Dado | Stale Time | GC Time |
|--------------|------------|---------|
| Todas as cartas | 5 min | 30 min |
| Cartas do usuário | 2 min | 5 min |
| Carta individual | 10 min | 30 min |
| Top Rankings | 30 seg | 5 min |
| Stats do usuário | 1 min | 5 min |
| Stats globais | 2 min | 10 min |

## Sistema de Tiers

O RankingService implementa um sistema de progressão por tiers:

| Tier | Pontuação Mínima |
|------|------------------|
| Bronze | 0 |
| Prata | 500 |
| Ouro | 1.500 |
| Platina | 3.500 |
| Diamante | 7.000 |
| Mestre | 15.000 |
| Grão-Mestre | 30.000 |
| Lenda | 50.000 |

## Uso nos Componentes

### Antes (direto com Supabase)

```typescript
const loadCollection = async () => {
  const { data, error } = await supabase
    .from('user_cards')
    .select('*, element_cards:card_id (*)')
    .eq('user_id', user?.id);
  // ...
};
```

### Depois (com hooks otimizados)

```typescript
const { 
  userCards, 
  allCards, 
  filteredUserCards, 
  stats, 
  isLoading 
} = useCardCollection({
  search: searchTerm,
  rarity: selectedRarity,
  elementType: selectedElement,
  sortBy: 'name',
  sortOrder: 'asc'
});
```

## Benefícios

1. **Separação de Responsabilidades**: Lógica de negócio isolada em serviços
2. **Reutilização**: Hooks podem ser usados em qualquer componente
3. **Cache Automático**: React Query gerencia cache e invalidação
4. **Type Safety**: TypeScript em toda a stack
5. **Testabilidade**: Serviços podem ser testados unitariamente
6. **Performance**: Memoization evita recálculos desnecessários
7. **Manutenibilidade**: Código organizado e modular

## Próximos Passos

1. Migrar componentes existentes para usar os novos hooks
2. Adicionar testes unitários para os serviços
3. Implementar mais otimizações de performance (image lazy loading, virtual lists)
4. Expandir sistema de cache para dados offline
