# 📚 Exemplos de Uso - Super Trunfo dos Elementos

Este documento contém exemplos práticos de como usar cada camada da arquitetura.

## 📋 Índice

1. [Repositórios](#repositórios)
2. [Services](#services)
3. [Hooks](#hooks)
4. [Componentes](#componentes)
5. [Fluxos Completos](#fluxos-completos)

## Repositórios

### Usando Card Repository

```typescript
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';

// Criar repositório
const cardRepository = RepositoryFactory.createCardRepository(supabase);

// Buscar cartas do usuário
const loadUserCards = async (userId: string) => {
  try {
    const cards = await cardRepository.findByUserId(userId);
    console.log(`Cartas carregadas: ${cards.length}`);
    return cards;
  } catch (error) {
    console.error('Erro ao carregar cartas:', error);
    throw error;
  }
};

// Buscar carta específica
const loadCardById = async (cardId: string) => {
  try {
    const card = await cardRepository.findById(cardId);
    if (!card) {
      console.log('Carta não encontrada');
      return null;
    }
    return card;
  } catch (error) {
    console.error('Erro ao buscar carta:', error);
    throw error;
  }
};

// Buscar todas as cartas disponíveis
const loadAllCards = async () => {
  try {
    const cards = await cardRepository.findAll();
    console.log(`Total de cartas: ${cards.length}`);
    return cards;
  } catch (error) {
    console.error('Erro ao buscar cartas:', error);
    throw error;
  }
};

// Adicionar carta para usuário
const addCardToUser = async (userId: string, cardId: string) => {
  try {
    await cardRepository.addCard(userId, cardId);
    console.log('Carta adicionada com sucesso');
  } catch (error) {
    console.error('Erro ao adicionar carta:', error);
    throw error;
  }
};
```

### Usando Ranking Repository

```typescript
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';

// Criar repositório
const rankingRepository = RepositoryFactory.createRankingRepository(supabase);

// Buscar ranking do usuário
const loadUserRanking = async (userId: string) => {
  try {
    const ranking = await rankingRepository.findByUserId(userId);
    if (!ranking) {
      console.log('Ranking não encontrado para usuário');
      return null;
    }
    console.log(`Win rate: ${ranking.win_rate}%`);
    return ranking;
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    throw error;
  }
};

// Atualizar estatísticas após batalha
const updateBattleStats = async (userId: string, victory: boolean) => {
  try {
    await rankingRepository.updateStats(userId, victory);
    console.log(`Estatísticas atualizadas: ${victory ? 'Vitória' : 'Derrota'}`);
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    throw error;
  }
};

// Buscar top rankings
const loadTopRankings = async (limit: number = 10) => {
  try {
    const rankings = await rankingRepository.getTopRankings(limit);
    console.log(`Top ${rankings.length} jogadores carregados`);
    return rankings;
  } catch (error) {
    console.error('Erro ao carregar rankings:', error);
    throw error;
  }
};
```

## Services

### Usando Battle Service

```typescript
import { BattleService } from '@/application/services';
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';

// Criar serviço com dependências
const createBattleService = () => {
  const cardRepo = RepositoryFactory.createCardRepository(supabase);
  const rankingRepo = RepositoryFactory.createRankingRepository(supabase);
  return new BattleService(cardRepo, rankingRepo);
};

// Validar tamanho do deck
const validateDeck = (cardCount: number) => {
  const service = createBattleService();
  
  try {
    service.validateDeckSize(cardCount);
    console.log('Deck válido');
    return true;
  } catch (error) {
    console.error('Deck inválido:', error.message);
    return false;
  }
};

// Criar deck do oponente
const createOpponentDeck = async (deckSize: number) => {
  const service = createBattleService();
  
  try {
    const opponentDeck = await service.createOpponentDeck(deckSize);
    console.log(`Deck do oponente criado com ${opponentDeck.length} cartas`);
    return opponentDeck;
  } catch (error) {
    console.error('Erro ao criar deck do oponente:', error);
    throw error;
  }
};

// Determinar vencedor da rodada
const determineRoundWinner = (
  playerCard: ElementCard,
  opponentCard: ElementCard,
  attribute: BattleAttribute
) => {
  const service = createBattleService();
  
  const result = service.determineWinner(playerCard, opponentCard, attribute);
  
  console.log(`Vencedor: ${result.winner}`);
  console.log(`Jogador: ${result.playerValue} vs Oponente: ${result.opponentValue}`);
  
  return result;
};

// Salvar resultado da batalha
const saveBattleResult = async (userId: string, victory: boolean) => {
  const service = createBattleService();
  
  try {
    await service.saveResult(userId, victory);
    console.log('Resultado salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar resultado:', error);
    throw error;
  }
};
```

## Hooks

### Usando Battle Orchestrator

```typescript
import { useBattleOrchestrator } from '@/hooks/battle/useBattleOrchestrator';

const BattleComponent = () => {
  const {
    // Estado
    battleState,
    isLoading,
    error,
    
    // Ações
    startBattle,
    selectAttribute,
    resetBattle,
    
    // UI State
    currentPhase,
    showVictory,
  } = useBattleOrchestrator(userId);

  // Iniciar batalha
  const handleStartBattle = async () => {
    try {
      await startBattle(selectedCards);
      console.log('Batalha iniciada!');
    } catch (error) {
      console.error('Erro ao iniciar batalha:', error);
    }
  };

  // Selecionar atributo
  const handleSelectAttribute = (attribute: BattleAttribute) => {
    selectAttribute(attribute);
    console.log(`Atributo selecionado: ${attribute}`);
  };

  // Reiniciar batalha
  const handleReset = () => {
    resetBattle();
    console.log('Batalha resetada');
  };

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      
      {currentPhase === 'selection' && (
        <AttributeSelector onSelect={handleSelectAttribute} />
      )}
      
      {currentPhase === 'result' && (
        <BattleResult result={battleState.battleResult} />
      )}
      
      {showVictory && (
        <VictoryEffect />
      )}
    </div>
  );
};
```

### Usando Battle Logic

```typescript
import { useBattleLogic } from '@/hooks/battle/useBattleLogic';

const BattleLogicComponent = () => {
  const {
    // Estado da batalha
    playerDeck,
    opponentDeck,
    playerCard,
    opponentCard,
    playerScore,
    opponentScore,
    round,
    
    // Ações
    startGame,
    selectAttribute,
    nextRound,
    
    // Estado do jogo
    gameOver,
    winner,
  } = useBattleLogic();

  // Exemplo de uso
  useEffect(() => {
    if (playerCard && opponentCard) {
      console.log('Rodada atual:', round);
      console.log('Carta do jogador:', playerCard.name);
      console.log('Carta do oponente:', opponentCard.name);
    }
  }, [playerCard, opponentCard, round]);

  // Avançar para próxima rodada
  const handleNextRound = () => {
    if (nextRound) {
      nextRound();
      console.log('Próxima rodada iniciada');
    }
  };

  return (
    <div>
      <p>Rodada: {round}</p>
      <p>Pontuação - Você: {playerScore} | Oponente: {opponentScore}</p>
      
      {gameOver && (
        <div>
          <h2>{winner === 'player' ? 'Você venceu!' : 'Você perdeu!'}</h2>
        </div>
      )}
    </div>
  );
};
```

## Componentes

### Usando BattleCard

```typescript
import { BattleCard } from '@/components/BattleCard';

const CardDisplay = () => {
  const handleCardClick = (card: ElementCard) => {
    console.log('Carta clicada:', card.name);
  };

  return (
    <BattleCard
      card={hydrogenCard}
      isRevealed={true}
      selectedAttribute="atomic_number"
      onClick={handleCardClick}
      className="hover:scale-105"
    />
  );
};
```

### Usando AttributeSelector

```typescript
import { AttributeSelector } from '@/components/battle/AttributeSelector';

const AttributeSelection = () => {
  const handleSelect = (attribute: BattleAttribute) => {
    console.log('Atributo selecionado:', attribute);
    // Continuar lógica da batalha
  };

  return (
    <AttributeSelector
      card={currentCard}
      onSelect={handleSelect}
      disabled={false}
    />
  );
};
```

## Fluxos Completos

### Fluxo: Iniciar Batalha Completa

```typescript
import { useState, useCallback } from 'react';
import { useBattleOrchestrator } from '@/hooks/battle/useBattleOrchestrator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const BattleFlow = () => {
  const { user } = useAuth();
  const [selectedCards, setSelectedCards] = useState<ElementCard[]>([]);
  
  const {
    battleState,
    isLoading,
    error,
    startBattle,
    selectAttribute,
    currentPhase,
  } = useBattleOrchestrator(user?.id);

  // Passo 1: Selecionar cartas
  const handleCardSelection = useCallback((cards: ElementCard[]) => {
    if (cards.length < 6) {
      toast.error('Selecione pelo menos 6 cartas');
      return;
    }
    setSelectedCards(cards);
  }, []);

  // Passo 2: Iniciar batalha
  const handleStartBattle = useCallback(async () => {
    try {
      await startBattle(selectedCards);
      toast.success('Batalha iniciada!');
    } catch (error) {
      toast.error('Erro ao iniciar batalha');
      console.error(error);
    }
  }, [selectedCards, startBattle]);

  // Passo 3: Jogada
  const handlePlay = useCallback((attribute: BattleAttribute) => {
    selectAttribute(attribute);
  }, [selectAttribute]);

  return (
    <div>
      {/* Fase 1: Seleção de cartas */}
      {!battleState && (
        <DeckBuilder
          onCardsSelected={handleCardSelection}
          onStartBattle={handleStartBattle}
          isLoading={isLoading}
        />
      )}

      {/* Fase 2: Batalha em andamento */}
      {battleState && currentPhase === 'selection' && (
        <BattleArena
          battleState={battleState}
          onAttributeSelect={handlePlay}
        />
      )}

      {/* Fase 3: Resultado */}
      {currentPhase === 'result' && (
        <BattleResultScreen
          result={battleState.battleResult}
          onContinue={() => {/* próxima rodada */}}
        />
      )}

      {/* Erros */}
      {error && <ErrorMessage error={error} />}
    </div>
  );
};
```

### Fluxo: Carregar e Exibir Ranking

```typescript
import { useState, useEffect } from 'react';
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';

const RankingFlow = () => {
  const [rankings, setRankings] = useState<CardGameRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRankings = async () => {
      try {
        setIsLoading(true);
        
        // Criar repositório
        const rankingRepo = RepositoryFactory.createRankingRepository(supabase);
        
        // Buscar rankings
        const data = await rankingRepo.getTopRankings(10);
        
        setRankings(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar rankings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankings();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>Top 10 Jogadores</h2>
      <ul>
        {rankings.map((ranking, index) => (
          <li key={ranking.id}>
            <span>#{index + 1}</span>
            <span>{ranking.player_name}</span>
            <span>{ranking.total_score} pontos</span>
            <span>{ranking.win_rate}% win rate</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Fluxo: Abrir Pacote de Cartas

```typescript
import { useState } from 'react';
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PackOpeningFlow = () => {
  const [newCards, setNewCards] = useState<ElementCard[]>([]);
  const [isOpening, setIsOpening] = useState(false);

  const openPack = async (userId: string, packType: 'basic' | 'premium') => {
    try {
      setIsOpening(true);
      
      // Criar repositório
      const cardRepo = RepositoryFactory.createCardRepository(supabase);
      
      // Buscar todas as cartas disponíveis
      const allCards = await cardRepo.findAll();
      
      // Selecionar cartas aleatórias baseado no tipo do pacote
      const cardsToOpen = selectRandomCards(allCards, packType);
      
      // Adicionar cartas ao usuário
      for (const card of cardsToOpen) {
        await cardRepo.addCard(userId, card.id);
      }
      
      setNewCards(cardsToOpen);
      toast.success(`${cardsToOpen.length} novas cartas obtidas!`);
    } catch (error) {
      toast.error('Erro ao abrir pacote');
      console.error(error);
    } finally {
      setIsOpening(false);
    }
  };

  const selectRandomCards = (
    allCards: ElementCard[],
    packType: 'basic' | 'premium'
  ): ElementCard[] => {
    const count = packType === 'premium' ? 5 : 3;
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  return (
    <PackOpening
      onOpen={openPack}
      newCards={newCards}
      isOpening={isOpening}
    />
  );
};
```

---

## 🎯 Dicas

### Performance

```typescript
// ✅ CORRETO: Memorize valores calculados
const totalPower = useMemo(
  () => cards.reduce((sum, card) => sum + card.atomic_number, 0),
  [cards]
);

// ✅ CORRETO: Memorize callbacks
const handleCardClick = useCallback(
  (cardId: string) => {
    console.log('Card clicked:', cardId);
  },
  []
);
```

### Error Handling

```typescript
// ✅ CORRETO: Try-catch com feedback
const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await repository.findAll();
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Erro ao carregar dados');
  } finally {
    setIsLoading(false);
  }
};
```

### Type Safety

```typescript
// ✅ CORRETO: Use tipos específicos
const calculateAttribute = (
  card: ElementCard,
  attribute: BattleAttribute
): number => {
  return card[attribute] as number;
};
```

---

Para mais exemplos, consulte:
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Arquitetura completa
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Guia de desenvolvimento
- [README.test.md](../README.test.md) - Guia de testes
