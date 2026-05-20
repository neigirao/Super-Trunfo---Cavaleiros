## Objetivo

Substituir o visual atual da batalha (`BattleArenaV2` + `TopBar`/`BottomBar`/`BattleField`/`BattleCard`) pelo design **Aurum Sanctum** do mockup enviado, mantendo **100% da lógica** (hooks `useBattleOrchestrator`, `useBattleLogic`, `useBattleState`, `useBattleEffects`, seleção de atributo, timer, IA, salvamento de resultado).

Nenhuma alteração em serviços, repositórios, schema do Supabase ou regras de jogo.

---

## Escopo

### O que vai mudar (apenas visual da rota `/game` → modo Batalha)
- Fundo: cosmos escuro com estrelas, nebulosa, constelações SVG, marca d'água da tabela periódica e fórmulas químicas flutuantes.
- Colunas dóricas decorativas nas laterais.
- Header já existente (Navbar) **não é tocado** — o "header Aurum" do mockup fica embutido como subbar dentro da arena para não duplicar navegação.
- Subbar com: indicador de Round (losangos dourados), timer ("Cosmo Restante"), botões PAUSAR / DESISTIR.
- Pods laterais (player / oponente): avatar com clip hexagonal, nome, título, vida em "escudos", nível + XP, vitórias/baixas.
- Cartas no estilo mármore com pediment dourado, moldura do retrato com anéis de Bohr, badge de número atômico, símbolo do elemento, massa, lista de atributos com o atributo escolhido destacado (gradiente dourado + ornamentos).
- Painel central "Oráculo" (substitui a tela de resultado da rodada): mostra atributo escolhido, valor do jogador, valor do oponente, vencedor da rodada com efeito sun-burst.
- Estado "aguardando oponente": carta do oponente vira `CardBack` selada com selo Ω.
- Estado "inspecionar carta": overlay com versão ampliada da carta + painel de detalhes (lore, fatos do elemento, histórico de uso).
- "Mão" de cartas miniaturas na base (visualização do deck restante).

### O que NÃO muda
- Hooks de batalha, fluxo de turnos, IA, salvamento, autenticação, rotas.
- Componentes fora de batalha (Navbar, Coleção, Ranking, Admin, etc.).
- Schema do banco / tipos de `ElementCard`.

---

## Mapeamento de dados (mockup → projeto)

| Mockup           | Fonte real                                                        |
|------------------|-------------------------------------------------------------------|
| `el.name`        | `card.name`                                                       |
| `el.symbol`      | `card.symbol`                                                     |
| `el.atomic`      | `card.atomic_number`                                              |
| `el.mass`        | `card.atomic_mass`                                                |
| `el.density`     | `card.density`                                                    |
| `el.fusion`      | `card.melting_point`                                              |
| `el.reactivity`  | `card.reactivity`                                                 |
| `el.radioactivity` | `card.radioactivity`                                            |
| `el.rarity`      | `card.rarity` (mapeado para Common/Rare/Epic/Legendary)           |
| `el.greek`       | derivado de `card.knight_name` ou fallback do símbolo             |
| `portraitSrc`    | `card.image_url` (com fallback `/placeholder.svg`)                |
| Atributo escolhido | `battle.selectedAttribute` (`BattleAttribute`)                  |
| Round            | `battle.round`                                                    |
| HP do pod        | `playerDeck.length` / `opponentDeck.length` (cartas restantes)    |
| NV / XP          | `effects.playerLevel.level` / `experience` / `experienceToNextLevel` |
| Timer            | tempo restante calculado em `BattleArenaV2` (já existe)           |

---

## Arquitetura proposta

Novo diretório `src/components/battle/aurum/` com componentes presentacionais puros (sem lógica de jogo), consumidos por uma nova arena.

```text
src/components/battle/aurum/
├── AurumArena.tsx           # Orquestra layout + estados (reveal/waiting/inspect)
├── AurumBackground.tsx      # stars + nebula + constellations + watermark + formulas
├── AurumColumns.tsx         # colunas dóricas esquerda/direita
├── AurumSubbar.tsx          # round + timer + pausar/desistir
├── AurumPod.tsx             # pod lateral do jogador/oponente
├── AurumCard.tsx            # carta de mármore com atributos
├── AurumCardBack.tsx        # verso selado (waiting)
├── AurumOracle.tsx          # painel central de resultado (reveal)
├── AurumWaiting.tsx         # painel central enquanto IA pensa
├── AurumInspectOverlay.tsx  # overlay de inspeção de carta
├── AurumHand.tsx            # mão miniatura na base
└── tokens.ts                # paleta + helpers (rarityColor, fmt, etc.)
```

### Design tokens
Adicionar ao `src/index.css` e `tailwind.config.ts` tokens semânticos da paleta Aurum (HSL), por exemplo:
- `--aurum-gold: 43 88% 62%`
- `--aurum-gold-dark: 36 53% 35%`
- `--aurum-marble: 41 50% 90%`
- `--aurum-marble-deep: 38 35% 72%`
- `--aurum-ink: 24 70% 6%`
- `--aurum-cream: 43 80% 94%`
- `--aurum-blood: 0 64% 57%`

Importar fontes `Cinzel`, `Spectral`, `IBM Plex Mono` via `index.html` (Google Fonts) e expor classes utilitárias `font-display`, `font-body`, `font-mono-aurum` em `tailwind.config.ts`.

### Integração com fluxo existente
- `src/components/battle/BattlePhaseRenderer.tsx` passa a renderizar `AurumArena` no lugar de `BattleArenaV2` para a fase `battle`.
- `AurumArena` recebe exatamente os mesmos props (`logic`, `state`, `effects`, `actions`, `onSurrender`) — é um drop-in.
- Mapeia internamente:
  - `state.gamePhase === 'battle'` + `battle.selectedAttribute && !battle.battleResult` → `waiting`
  - `battle.battleResult` (efêmero, antes da próxima rodada) → `reveal` (overlay Oráculo sobre o campo)
  - Clique numa carta da mão → `inspect`
- `BattleResultScreen` e `GameOverScreen` continuam responsáveis pelas telas pós-rodada/fim de jogo (podem receber refresh visual em sprint futura).

### Estados implementados nesta entrega
1. **Reveal** — após escolha de atributo, mostra Oráculo central com valores e vencedor.
2. **Waiting** — IA pensando: carta do oponente vira verso selado + painel "SUSPENSIO".
3. **Inspect** — overlay opcional ao clicar numa carta da mão (não bloqueia gameplay).

---

## Plano de execução (sprints curtas)

### Sprint A — Fundação visual (tokens + fontes + background)
- Importar Cinzel/Spectral/IBM Plex Mono.
- Adicionar tokens Aurum em `index.css` + `tailwind.config.ts`.
- Criar `AurumBackground`, `AurumColumns`, `tokens.ts`.

### Sprint B — Estrutura da arena
- Criar `AurumArena` + `AurumSubbar` + `AurumPod`.
- Integrar com `BattlePhaseRenderer` via feature flag simples (constante) para permitir rollback rápido.

### Sprint C — Cartas e estados
- Criar `AurumCard` (com anéis de Bohr SVG, pediment, stats, highlight do atributo).
- Criar `AurumCardBack` para estado waiting.
- Criar `AurumOracle` para estado reveal.

### Sprint D — Mão e inspeção
- Criar `AurumHand` (deck restante do jogador como miniaturas).
- Criar `AurumInspectOverlay` (modal de inspeção, opcional ao clicar carta).

### Sprint E — Polimento responsivo
- Layout fluido: arena com `grid-template-columns: pod card oracle card pod` em desktop; pods colapsam para topo/base em < 1024px.
- Reduzir colunas dóricas e marca d'água em mobile.
- Garantir que cartas continuem visíveis sem scroll (memória `battle/card-display-priority`).

---

## Considerações técnicas

- **Performance**: efeitos visuais decorativos (constelações, fórmulas, marca d'água, colunas) ficam atrás de `pointer-events: none` e usam apenas CSS/SVG (sem libs novas).
- **Acessibilidade**: contraste do mármore (`#1a0e04` sobre `#f5ecd4`) ≈ 14:1 — OK. Texto cosmo (`#fff8e1` sobre fundo escuro) ≈ 13:1 — OK. Botões mantêm foco visível.
- **Animações**: reaproveitar `framer-motion` já presente para transições entre estados (fade/scale do Oráculo, flip do CardBack, slide do overlay de inspeção).
- **Sem novas dependências.**
- **Sem mudanças de backend / banco.**

---

## Critérios de aceitação

1. Ao iniciar uma batalha, a arena renderiza com fundo cósmico, colunas, pods laterais e duas cartas de mármore.
2. Selecionar um atributo destaca a linha correspondente em ambas as cartas com gradiente dourado.
3. Enquanto a IA "pensa", a carta do oponente exibe o verso selado e o painel central mostra "SUSPENSIO".
4. Ao resolver a rodada, o Oráculo central aparece com valores, delta e mensagem temática.
5. Clicar numa carta da mão abre o overlay de inspeção; botão "Invocar" fecha o overlay.
6. Toda a lógica de turnos, pontuação, XP e fim de jogo continua funcionando exatamente como antes.
7. Layout permanece utilizável em viewports ≥ 768px (mobile pode receber polimento adicional em sprint futura).

---

## Riscos & mitigação

- **Layout denso pode quebrar em telas pequenas** → começar mobile-first nas Sprints B/E; manter `BattleArenaV2` como fallback acessível via feature flag por 1 release.
- **Tokens podem conflitar com cosmic-* existentes** → todos os novos tokens usam prefixo `aurum-*`.
- **Imagens dos cavaleiros (`card.image_url`) podem estar vazias** → fallback radial colorido por raridade já contemplado no mockup.
