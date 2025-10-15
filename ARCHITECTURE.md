# Arquitetura do Card Battle Game

## Visão Geral
Jogo de cartas baseado nas regras do Super Trunfo, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## Regras do Jogo (Super Trunfo)

### Mecânica Principal
1. Cada jogador tem um baralho de cartas
2. A cada rodada, ambos jogadores revelam uma carta
3. O jogador da vez escolhe um atributo para comparação
4. O vencedor da rodada leva AMBAS as cartas (sua carta + carta do oponente)
5. As cartas ganhas vão para o final do baralho do vencedor
6. Em caso de empate, as cartas vão para uma pilha de descarte
7. O vencedor da próxima rodada leva também as cartas do descarte
8. O jogo termina quando um jogador fica sem cartas

### Condições de Vitória
- **Vitória**: Adversário fica sem cartas no baralho
- **Derrota**: Jogador fica sem cartas no baralho

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Battle.tsx       # Componente principal da batalha
│   ├── BattleCard.tsx   # Carta individual na batalha
│   ├── battle/          # Componentes específicos da batalha
│   │   ├── BattleControls.tsx    # Controles (pause, surrender)
│   │   ├── BattleProgress.tsx    # Progresso e pontuação
│   │   ├── CardCounter.tsx       # Contador de cartas
│   │   ├── ThinkingIndicator.tsx # Indicador de pensamento do oponente
│   │   └── TurnIndicator.tsx     # Indicador de turno
│   ├── effects/         # Efeitos visuais
│   │   ├── ParticleEffect.tsx   # Efeitos de partículas
│   │   └── VictoryEffect.tsx    # Efeito de vitória
│   ├── progression/     # Sistema de progressão
│   │   ├── AchievementSystem.tsx # Conquistas
│   │   └── PlayerLevel.tsx       # Nível do jogador
│   └── ui/             # Componentes UI reutilizáveis (shadcn)
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Autenticação
├── integrations/       # Integrações externas
│   └── supabase/      # Supabase client e types
├── pages/             # Páginas principais
│   ├── Game.tsx       # Página do jogo
│   ├── Ranking.tsx    # Página de ranking
│   ├── Collection.tsx # Coleção de cartas
│   └── Auth.tsx       # Autenticação
└── hooks/             # Custom hooks
    └── useMinimumCards.tsx # Verifica cartas mínimas
```

## Fluxo de Dados da Batalha

### Estado Principal (Battle.tsx)
```typescript
interface BattleState {
  playerDeck: Card[];        // Baralho do jogador
  opponentDeck: Card[];      // Baralho do oponente
  playerCurrentCard: Card;   // Carta atual do jogador
  opponentCurrentCard: Card; // Carta atual do oponente
  discardPile: Card[];       // Pilha de descarte (empates)
  playerScore: number;       // Pontuação do jogador
  opponentScore: number;     // Pontuação do oponente
  whoChooses: 'player' | 'opponent'; // Quem escolhe o atributo
  roundWinner: 'player' | 'opponent' | 'draw' | null;
  gameOver: boolean;
  winner: 'player' | 'opponent' | null;
}
```

### Ciclo de uma Rodada
1. **Início**: Carta do topo de cada baralho é revelada
2. **Escolha**: Jogador/oponente seleciona atributo
3. **Comparação**: Valores são comparados
4. **Resultado**: 
   - Vitória: Vencedor leva ambas cartas + descarte
   - Empate: Cartas vão para descarte
5. **Atualização**: Baralhos são atualizados
6. **Verificação**: Checa se algum jogador ficou sem cartas
7. **Próxima Rodada**: Se jogo não acabou, revela próximas cartas

## Database Schema

### Tabelas Principais

#### `element_cards`
```sql
- id: uuid (PK)
- name: text              # Nome do elemento
- knight_name: text       # Nome do cavaleiro
- rarity: text           # Raridade (common, rare, epic, legendary)
- attack: integer        # Atributo ataque
- defense: integer       # Atributo defesa
- intelligence: integer  # Atributo inteligência
- speed: integer         # Atributo velocidade
- image_url: text        # URL da imagem
```

#### `user_cards`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- card_id: uuid (FK -> element_cards)
- quantity: integer      # Quantidade da carta
```

#### `card_game_rankings`
```sql
- id: uuid (PK)
- user_id: uuid (FK -> auth.users)
- username: text
- total_score: integer       # Pontuação total
- games_won: integer         # Partidas vencidas
- games_lost: integer        # Partidas perdidas
- win_rate: decimal          # Taxa de vitória (%)
- favorite_element_type: text # Elemento favorito
- last_played_at: timestamp
```

## Sistema de Autenticação

### AuthContext
- Gerencia estado do usuário autenticado
- Providers: Google OAuth
- Perfis: Armazena informações adicionais do usuário
- Roles: `user` (padrão) ou `admin`

### Proteção de Rotas
Páginas protegidas redirecionam para `/auth` se não autenticado.

## Integrações

### Supabase
- **Database**: PostgreSQL para persistência
- **Auth**: Autenticação de usuários
- **Storage**: Imagens de cartas (bucket: `card-images`)
- **Edge Functions**: `ensure-minimum-cards` (garante cartas iniciais)

## Componentes UI (shadcn/ui)

Todos os componentes UI seguem o design system:
- **Cores**: HSL tokens do `index.css`
- **Temas**: Suporta dark/light mode
- **Variantes**: Componentes customizáveis via CVA

## Regras de Negócio

### Cartas Iniciais
- Usuários recebem 8 cartas comuns automaticamente ao criar conta
- Verificado por edge function `ensure-minimum-cards`

### Pack Opening
- Usuários podem abrir 1 pack a cada 7 dias
- Controlado pela tabela `user_pack_openings`

### IA do Oponente
- Seleciona atributo com maior valor da carta atual
- Delay de 2 segundos para simular "pensamento"
- Implementado em `Battle.tsx` na função `handleOpponentChoice`

## Performance

### Otimizações
- `framer-motion` para animações suaves
- Lazy loading de componentes quando possível
- React Query para cache de dados do Supabase

## Convenções de Código

### TypeScript
- Interfaces para todos os tipos complexos
- Strict mode habilitado
- Props sempre tipadas

### React
- Functional components
- Hooks para lógica reutilizável
- Context API para estado global

### CSS
- Tailwind CSS utility-first
- Design tokens no `index.css`
- Classes semânticas (não cores diretas)

## Manutenção e Evolução

### Para Adicionar Novas Features
1. Verifique se precisa de mudanças no banco (migrations)
2. Atualize interfaces TypeScript relevantes
3. Adicione testes se possível
4. Documente mudanças neste arquivo

### Para Modificar Regras do Jogo
1. **SEMPRE** consulte a seção "Regras do Jogo" acima
2. Atualize `Battle.tsx` mantendo a lógica do Super Trunfo
3. Teste todos os cenários (vitória, derrota, empate)
4. Atualize documentação se necessário

### Para Debugar Problemas
1. Console logs estão disponíveis automaticamente
2. Network requests podem ser inspecionados
3. Supabase logs disponíveis no dashboard
4. Edge function logs específicos por função
