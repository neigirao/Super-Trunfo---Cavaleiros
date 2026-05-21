# CLAUDE.md — Super Trunfo: Cavaleiros Elementais

Guia de referência rápida para desenvolvimento assistido por IA neste projeto.

## Comandos Essenciais

```bash
npm run dev      # Servidor de desenvolvimento (Vite)
npm run build    # Build de produção
npm run preview  # Preview do build de produção
```

Não há testes automatizados ou linter configurados no projeto.

## Arquitetura

### Estado Global (`App.tsx`)

Todo o estado do jogo vive em `App.tsx` via `useState`. Não há gerenciador de estado externo (Redux, Zustand, etc.).

Estados principais:
- `gameState: GameState` — tela atual (Menu, Playing, RoundResult, GameOver, Ranking, Admin)
- `deck: CardData[]` — baralho master, persistido em `localStorage` com a chave `superTrunfoDeck`
- `playerDeck / aiDeck: CardData[]` — mãos ativas durante uma partida
- `isPlayerTurn: boolean` — controla de quem é a vez
- `userProfile: UserProfile | null` — perfil Google do jogador logado
- `isAdmin: boolean` — habilitado quando `userProfile.email === ADMIN_EMAIL`

### Fluxo de Telas

```
Menu → Playing → RoundResult → Playing (loop)
                             ↘ GameOver → Menu
```

Telas auxiliares (acessíveis a partir do Menu):
- `Ranking` — sempre recebe `rankingData=[]` (sem backend)
- `Admin` — só aparece no Menu se `isAdmin === true`

### Componentes

| Componente | Responsabilidade |
|---|---|
| `Card` | Renderiza carta frente/verso com flip 3D CSS |
| `AdminPanel` | CRUD de cartas via modal; gera IDs sequencialmente |
| `Ranking` | Tabela de ranking (UI only, sem dados reais) |

### Tipos Centrais (`types.ts`)

- `ElementType` — 10 grupos químicos (enums em português)
- `Attribute` — 5 atributos de jogo (enums em português)
- `CardData` — estrutura de uma carta
- `GameState` — estados possíveis da máquina de estados do jogo
- `RoundResult` — resultado de uma rodada (vencedor, carta de cada um, valores, bônus)

## Regras de Negócio Importantes

### Vantagem Elemental
Definida em `advantageMap` em `App.tsx`. Ciclo de 5 relações (Halogênio > Metal Alcalino > Metal de Transição > Actinídeo > Gás Nobre > Halogênio). O bônus é `ADVANTAGE_BONUS_PERCENTAGE = 0.20` (20%) sobre o valor base do atributo vantajoso.

### Super Trunfo
Carta com `isSuperTrunfo: true` vence qualquer rodada exceto contra outro Super Trunfo (empate). A lógica fica em `handleAttributeSelect`, verificada antes da comparação de valores.

### Persistência do Baralho
O baralho master é carregado do `localStorage` na inicialização do estado (lazy init no `useState`). Qualquer mudança em `deck` é sincronizada via `useEffect`.

## Configuração Sensível (`App.tsx`)

```typescript
const ADMIN_EMAIL = 'neigirao@gmail.com';
const GOOGLE_CLIENT_ID = '368113957803-...apps.googleusercontent.com';
```

Estes valores estão hard-coded. Para ambientes diferentes, extrair para variáveis de ambiente (`.env.local`).

## Padrões a Seguir

- Componentes funcionais com TypeScript estrito
- Tailwind CSS para todo o estilo — sem CSS modules ou styled-components
- Sem biblioteca de gerenciamento de estado global
- Sem chamadas a APIs externas além do Google GSI (Auth)
- Imagens de cartas via `picsum.photos/seed/{nome}/400/600`

## Áreas Incompletas (ver ROADMAP.md)

- **IA passiva**: quando `isPlayerTurn = false`, nada acontece. A IA nunca executa uma jogada automaticamente.
- **Ranking sem backend**: `<Ranking rankingData={[]} />` — a tela existe mas sem dados.
- **Gemini API**: `vite.config.ts` expõe `GEMINI_API_KEY`, mas não há nenhum uso desta chave no código.
