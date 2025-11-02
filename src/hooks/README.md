# Hooks - Custom React Hooks

Esta pasta contém todos os hooks customizados do projeto, organizados por funcionalidade.

## 📁 Estrutura

```
src/hooks/
├── battle/                  # Hooks de batalha
│   ├── useBattleLogic.tsx   # Lógica principal de batalha
│   ├── useBattleCards.tsx   # Gerenciamento de cartas
│   └── __tests__/           # Testes dos hooks
├── use-toast.ts             # Hook de notificações (shadcn)
├── use-mobile.tsx           # Detecção de dispositivo móvel
├── useImageUpload.tsx       # Upload de imagens
└── useMinimumCards.tsx      # Verificação de cartas mínimas
```

## 🎯 Hooks por Categoria

### ⚔️ Battle Hooks

#### `useBattleLogic.tsx`
**Responsabilidade**: Gerencia toda a lógica de batalha do Super Trunfo

**Estado Gerenciado**:
- Baralhos (jogador e oponente)
- Cartas atuais em jogo
- Resultado da batalha
- Pontuações
- Rodadas

**Funções Principais**:
- `startBattle()`: Inicia nova batalha
- `calculateBattleResult()`: Calcula vencedor da rodada
- `nextRound()`: Avança para próxima rodada
- `getOpponentChoice()`: IA escolhe atributo
- `saveGameResult()`: Salva resultado no banco

**Exemplo**:
```typescript
const battleLogic = useBattleLogic(user?.id);

// Iniciar batalha
battleLogic.startBattle(playerCards, opponentCards);

// Selecionar atributo
const result = battleLogic.calculateBattleResult('atomic_number');

// Próxima rodada
const { gameOver, winner } = battleLogic.nextRound();
```

#### `useBattleCards.tsx`
**Responsabilidade**: Gerencia carregamento e criação de baralhos

**Estado Gerenciado**:
- Cartas do usuário
- Todas as cartas disponíveis
- Estado de loading

**Funções Principais**:
- `loadCards()`: Carrega cartas do banco
- `createOpponentDeck()`: Cria baralho do oponente
- `reloadCards()`: Recarrega cartas

**Exemplo**:
```typescript
const { userCards, allCards, isLoading, createOpponentDeck } = useBattleCards();

// Criar baralho do oponente
const opponentDeck = createOpponentDeck(userCards.length);
```

### 🖼️ Media Hooks

#### `useImageUpload.tsx`
**Responsabilidade**: Gerencia upload de imagens para Supabase Storage

**Funcionalidades**:
- Validação de formato e tamanho
- Upload para storage bucket
- Atualização de URLs no banco
- Feedback de progresso

**Exemplo**:
```typescript
const { uploadImage, uploading, error } = useImageUpload();

await uploadImage(file, cardId);
```

### 🎮 Game Hooks

#### `useMinimumCards.tsx`
**Responsabilidade**: Verifica se usuário tem cartas mínimas para jogar

**Funcionalidades**:
- Chama edge function para garantir mínimo de cartas
- Retorna estado de verificação
- Gerencia loading e erros

**Exemplo**:
```typescript
const { isChecking, hasMinimumCards } = useMinimumCards();

if (!hasMinimumCards) {
  // Usuário não tem cartas suficientes
}
```

### 📱 Utility Hooks

#### `use-mobile.tsx`
**Responsabilidade**: Detecta se está em dispositivo móvel

**Exemplo**:
```typescript
const isMobile = useMobile();

if (isMobile) {
  // Renderizar versão mobile
}
```

#### `use-toast.ts`
**Responsabilidade**: Sistema de notificações (shadcn/ui)

**Exemplo**:
```typescript
const { toast } = useToast();

toast({
  title: "Sucesso!",
  description: "Carta adicionada ao baralho",
});
```

## 🏗️ Anatomia de um Hook

### Estrutura Padrão
```typescript
/**
 * @fileoverview Descrição breve do hook
 * 
 * Responsável por:
 * - Responsabilidade 1
 * - Responsabilidade 2
 * 
 * @example
 * ```typescript
 * const { data, loading } = useExample();
 * ```
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Descrição do hook
 * 
 * @param param1 - Descrição do parâmetro
 * @returns Objeto com estado e funções
 */
export const useExample = (param1: string) => {
  // Estado
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Effects
  useEffect(() => {
    // Lógica de carregamento
  }, [param1]);
  
  // Callbacks
  const handleAction = useCallback(() => {
    // Ação
  }, [dependencies]);
  
  // Retorno
  return {
    data,
    loading,
    handleAction
  };
};
```

## 📝 Convenções

### Nomenclatura
- **Prefixo `use`**: Todos os hooks customizados
- **CamelCase**: useExampleHook
- **Descritivo**: Nome indica claramente a função

### Organização
- **Por Feature**: Hooks relacionados na mesma pasta (`/battle`)
- **Testes**: `__tests__/` na mesma pasta do hook
- **Exports**: Export nomeado, não default

### Dependências
```typescript
// ✅ BOM: Dependências claras
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]);

// ❌ RUIM: Array vazio quando há dependências
useEffect(() => {
  fetchData(userId);
}, []); // ⚠️ Missing dependency
```

## 🧪 Testes

### Exemplo de Teste
```typescript
import { renderHook, act } from '@testing-library/react';
import { useBattleLogic } from '../useBattleLogic';

describe('useBattleLogic', () => {
  it('should initialize battle state', () => {
    const { result } = renderHook(() => useBattleLogic('user-id'));
    
    expect(result.current.battle.playerScore).toBe(0);
    expect(result.current.battle.round).toBe(1);
  });
  
  it('should calculate battle result', () => {
    const { result } = renderHook(() => useBattleLogic('user-id'));
    
    act(() => {
      result.current.startBattle(playerCards, opponentCards);
    });
    
    act(() => {
      const battleResult = result.current.calculateBattleResult('atomic_number');
      expect(['win', 'lose', 'draw']).toContain(battleResult);
    });
  });
});
```

## 🚀 Melhores Práticas

### 1. Responsabilidade Única
Cada hook deve ter uma responsabilidade clara:
```typescript
// ✅ BOM: Foco específico
const useBattleLogic = () => { /* lógica de batalha */ };
const useBattleCards = () => { /* carregamento de cartas */ };

// ❌ RUIM: Muitas responsabilidades
const useBattle = () => { 
  /* lógica + cartas + UI + ranking + ... */ 
};
```

### 2. Memoização
Use `useCallback` e `useMemo` quando apropriado:
```typescript
// Funções que são props de componentes
const handleAction = useCallback(() => {
  // ação
}, [dependencies]);

// Cálculos pesados
const complexValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 3. Cleanup
Sempre limpe side effects:
```typescript
useEffect(() => {
  const subscription = api.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 4. Error Handling
Sempre trate erros:
```typescript
const [error, setError] = useState<Error | null>(null);

try {
  // operação
} catch (err) {
  setError(err as Error);
  toast({
    title: "Erro",
    description: err.message,
    variant: "destructive"
  });
}
```

### 5. Loading States
Forneça feedback de loading:
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // fetch
  } finally {
    setLoading(false);
  }
};
```

## 🤖 Para a IA

Ao criar/modificar hooks:
1. **Verifique hooks existentes** antes de criar novos
2. **Use tipos centralizados** de `@/types`
3. **Documente com JSDoc** todos os hooks
4. **Adicione testes** para hooks com lógica complexa
5. **Siga o padrão** de estrutura estabelecido
6. **Memoize callbacks** que são passados como props
7. **Gerencie loading e error states**
8. **Limpe side effects** no cleanup
9. **Uma responsabilidade por hook**
10. **Exports nomeados** (não default)
