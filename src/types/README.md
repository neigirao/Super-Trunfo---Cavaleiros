# Types - Sistema de Tipos Centralizado

Esta pasta contém todos os tipos TypeScript centralizados do projeto Super Trunfo. A centralização de tipos facilita a manutenção, reutilização e compreensão do código pela IA.

## 📁 Estrutura

```
src/types/
├── index.ts           # Ponto de entrada - reexporta todos os tipos
├── card.types.ts      # Tipos relacionados a cartas
├── battle.types.ts    # Tipos relacionados a batalhas
├── user.types.ts      # Tipos relacionados a usuários e perfis
├── game.types.ts      # Tipos relacionados à mecânica do jogo
└── README.md          # Este arquivo
```

## 🎯 Objetivo

- **Centralização**: Um único local para todos os tipos do projeto
- **Reutilização**: Evita duplicação de tipos entre arquivos
- **Documentação**: Todos os tipos possuem JSDoc explicativo
- **Manutenibilidade**: Facilita updates e refatorações
- **IA-Friendly**: Tipos bem documentados melhoram a compreensão da IA

## 📚 Módulos

### `card.types.ts`
Tipos relacionados às cartas do jogo:
- `ElementCard`: Estrutura completa de uma carta
- `BattleAttribute`: Atributos que podem ser comparados
- `CardRarity`: Níveis de raridade
- `ElementType`: Tipos de elementos químicos
- `UserCard`: Carta com informações de posse do usuário

### `battle.types.ts`
Tipos relacionados ao sistema de batalha:
- `BattleState`: Estado completo de uma batalha
- `BattleResult`: Resultado de uma rodada
- `GamePhase`: Fases do jogo
- `TurnOwner`: De quem é o turno
- `AIConfig`: Configuração da IA oponente

### `user.types.ts`
Tipos relacionados a usuários e progressão:
- `UserProfile`: Perfil do usuário
- `CardGameRanking`: Estatísticas de ranking
- `Achievement`: Sistema de conquistas
- `PlayerLevel`: Nível e experiência
- `UserDeck`: Baralhos salvos

### `game.types.ts`
Tipos relacionados à mecânica geral:
- `DailyChallenge`: Desafios diários
- `LiveEvent`: Eventos ao vivo
- `Tutorial`: Sistema de tutoriais
- `PackOpening`: Abertura de pacotes
- `AdminNotification`: Notificações do sistema

## 🔧 Como Usar

### Import Centralizado (Recomendado)
```typescript
import { ElementCard, BattleState, UserProfile } from '@/types';
```

### Import Específico
```typescript
import { ElementCard } from '@/types/card.types';
import { BattleState } from '@/types/battle.types';
```

## ✅ Boas Práticas

1. **Sempre adicione JSDoc**: Documente novos tipos com comentários explicativos
2. **Use tipos descritivos**: Nome deve deixar claro o propósito
3. **Evite `any`**: Prefira tipos específicos ou `unknown`
4. **Exporte pelo index.ts**: Adicione novos tipos ao arquivo central
5. **Organize por domínio**: Mantenha tipos relacionados no mesmo arquivo

## 📖 Exemplos

### Definindo uma carta
```typescript
const hydrogenCard: ElementCard = {
  id: '123',
  name: 'Hidrogênio',
  symbol: 'H',
  atomic_number: 1,
  atomic_mass: 1.008,
  density: 0.0899,
  melting_point: 14.01,
  reactivity: 85,
  radioactivity: 0,
  knight_name: 'Cavaleiro do Primeiro Elemento',
  special_ability: 'Combustão Estelar',
  rarity: 'legendary',
  element_type: 'non-metal',
  is_super_trump: false
};
```

### Usando o estado de batalha
```typescript
const initialBattle: BattleState = {
  playerDeck: playerCards,
  opponentDeck: opponentCards,
  playerCard: playerCards[0],
  opponentCard: opponentCards[0],
  selectedAttribute: null,
  battleResult: null,
  playerScore: 0,
  opponentScore: 0,
  round: 1,
  discardPile: []
};
```

## 🤖 Para a IA

Ao trabalhar com este projeto:
1. **Sempre consulte os tipos** antes de criar novos
2. **Reutilize tipos existentes** em vez de criar duplicados
3. **Adicione JSDoc** em novos tipos
4. **Mantenha consistência** com os padrões estabelecidos
5. **Atualize este README** ao adicionar novos módulos de tipos
