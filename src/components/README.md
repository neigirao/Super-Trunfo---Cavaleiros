# Components - Componentes React

Esta pasta contém todos os componentes React do projeto, organizados por funcionalidade e responsabilidade.

## 📁 Estrutura

```
src/components/
├── ui/                    # Componentes de UI reutilizáveis (shadcn/ui)
├── battle/                # Componentes específicos de batalha
├── effects/               # Efeitos visuais (partículas, vitória)
├── progression/           # Sistema de progressão (level, achievements)
├── tutorial/              # Sistema de tutoriais
├── admin/                 # Componentes da área administrativa
├── Battle.tsx             # Componente principal de batalha
├── BattleCard.tsx         # Carta em batalha
├── DeckBuilder.tsx        # Construtor de baralho
├── Navbar.tsx             # Barra de navegação
├── PackOpening.tsx        # Abertura de pacotes
└── ... (outros componentes principais)
```

## 🎯 Categorias

### 📦 `/ui` - Componentes de Interface
Componentes base do shadcn/ui, totalmente customizáveis:
- **Button, Card, Dialog, etc**: Componentes fundamentais
- **Form**: Sistema de formulários com validação
- **Toast**: Notificações
- **ErrorBoundary**: Tratamento de erros

**Padrão**: Todos seguem a API do Radix UI + Tailwind

### ⚔️ `/battle` - Componentes de Batalha
Componentes específicos do sistema de combate:
- `BattleField.tsx`: Campo de batalha com as cartas
- `AttributeSelector.tsx`: Seleção de atributos
- `BattleControls.tsx`: Controles (render, pausar)
- `BattleProgress.tsx`: Barra de progresso
- `BattleResultScreen.tsx`: Tela de resultado da rodada
- `GameOverScreen.tsx`: Tela de fim de jogo
- `TurnIndicator.tsx`: Indicador de turno
- `CardCounter.tsx`: Contador de cartas
- `PowerCounter.tsx`: Contador de poder
- `ThinkingIndicator.tsx`: Indicador "pensando..." da IA

### ✨ `/effects` - Efeitos Visuais
Componentes de animações e efeitos:
- `VictoryEffect.tsx`: Efeito de vitória/derrota
- `ParticleEffect.tsx`: Sistema de partículas

### 📈 `/progression` - Sistema de Progressão
- `PlayerLevel.tsx`: Exibição de nível e XP
- `AchievementSystem.tsx`: Sistema de conquistas

### 📚 `/tutorial` - Sistema de Tutorial
- `TutorialModal.tsx`: Modal de tutorial interativo

### 🛠️ `/admin` - Área Administrativa
- `CardImageUpload.tsx`: Upload de imagens de cartas

## 🏗️ Arquitetura de Componentes

### Componentes Principais (Smart Components)
Gerenciam estado e lógica de negócio:
- `Battle.tsx`: Orquestra toda a batalha
- `DeckBuilder.tsx`: Gerencia seleção de cartas
- `PackOpening.tsx`: Lógica de abertura de pacotes

### Componentes de Apresentação (Dumb Components)
Apenas exibem dados e emitem eventos:
- Todos em `/battle`, `/effects`, `/progression`
- Recebem props e callbacks
- Sem lógica de negócio

## 📝 Convenções

### Nomenclatura
- **PascalCase**: Todos os componentes
- **Descritivo**: Nome deve indicar claramente a função
- **Sufixos**: 
  - `Screen` para telas completas
  - `Modal` para modais
  - `Card` para cards
  - `Button` para botões customizados

### Estrutura de Arquivo
```typescript
/**
 * @fileoverview Descrição breve do componente
 * 
 * Explicação mais detalhada sobre:
 * - Responsabilidades
 * - Props importantes
 * - Estado gerenciado
 * 
 * @component
 */
import { ... } from 'react';

interface ComponentProps {
  // Props documentadas
}

/**
 * Descrição do componente
 * 
 * @example
 * ```tsx
 * <Component prop1="value" />
 * ```
 */
const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Implementação
  return <div>...</div>;
};

export default Component;
```

### Props
- **Interface dedicada**: Sempre crie uma interface para props
- **Documentação**: Use JSDoc nas props importantes
- **Callbacks**: Prefixo `on` para eventos (onClick, onSubmit)
- **Flags**: Prefixo `is`, `has`, `should` para booleanos

## 🎨 Estilos

### Tailwind CSS
- **Design System**: Use tokens do `index.css`
- **Cores**: Use variáveis CSS (--primary, --secondary, etc)
- **Responsivo**: Mobile-first com breakpoints md, lg
- **Dark Mode**: Suportado via `dark:` prefix

### Classes Customizadas
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  props.className
)} />
```

## 🔧 Hooks Comuns

Hooks frequentemente usados nos componentes:
- `useAuth()`: Contexto de autenticação
- `useToast()`: Sistema de notificações
- `useBattleLogic()`: Lógica de batalha
- `useBattleCards()`: Gerenciamento de cartas

## 🧪 Testes

Componentes críticos possuem testes em `__tests__/`:
```
BattleCard.test.tsx
```

### Estratégia
- **Unit Tests**: Componentes de UI isolados
- **Integration Tests**: Fluxos completos (Battle, DeckBuilder)
- **Snapshot Tests**: Evitar regressões visuais

## 🚀 Melhores Práticas

1. **Separação de Responsabilidades**
   - Lógica em hooks customizados
   - Componentes focam em renderização

2. **Composição sobre Complexidade**
   - Componentes pequenos e focados
   - Combinar múltiplos componentes simples

3. **Performance**
   - `memo()` para componentes que rerenderizam muito
   - `useCallback()` para callbacks passadas como props
   - `useMemo()` para cálculos pesados

4. **Acessibilidade**
   - Atributos ARIA quando necessário
   - Semântica HTML correta
   - Navegação por teclado

5. **Documentação**
   - JSDoc em componentes complexos
   - Exemplos de uso
   - Props bem documentadas

## 🤖 Para a IA

Ao criar/modificar componentes:
1. **Verifique componentes existentes** antes de criar novos
2. **Reutilize componentes de UI** da pasta `/ui`
3. **Mantenha componentes pequenos** (<200 linhas)
4. **Documente com JSDoc** componentes complexos
5. **Use tipos centralizados** de `@/types`
6. **Siga os padrões de naming** estabelecidos
7. **Adicione testes** para componentes críticos
