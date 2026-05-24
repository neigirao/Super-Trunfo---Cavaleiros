# Roadmap — Super Trunfo: Cavaleiros Elementais

Documento de planejamento baseado na auditoria de 5 dimensões (engenharia, arquitetura, UX, design e game design) realizada em maio/2026. Itens organizados por prioridade de execução.

---

## 🔥 Urgente — Corrupção de Dados (executar antes do próximo deploy)

### U1 — `saveRanking` escreve na tabela do sistema errado

**Problema:** `App.tsx:132` faz `.from('rankings').insert()`. A tabela `rankings` pertence a outro sistema no mesmo banco (Quiz de Jogadores). Cada vitória/derrota no Cavaleiros polui o ranking alheio.

**Plano de Ação:**
- Remover `saveRanking` (linhas 127–142) e `loadRanking` (linhas 144–172) de `App.tsx`
- Confirmar que `upsertGameResult` em `utils/supabase.ts` aponta para `card_game_rankings` (já correto)
- Rodar `npm run build` para garantir que nenhum caller quebrou

**Arquivos:** `App.tsx`

---

### U2 — Dois clientes Supabase paralelos, um com env var ausente

**Problema:** `HomeMenu.tsx:4` importa `supabase` de `../src/integrations/supabase/client`, que usa `VITE_SUPABASE_PUBLISHABLE_KEY` — variável não existe no `.env.local`. Resultado: cliente `undefined`, autenticação falha silenciosamente.

**Plano de Ação:**
- Em `HomeMenu.tsx`, trocar import para `../utils/supabase`
- Confirmar que nenhum outro arquivo importa de `src/integrations/supabase/client`
- Deletar `src/integrations/supabase/client.ts` para evitar reincidência

**Arquivos:** `components/HomeMenu.tsx`, `src/integrations/supabase/client.ts`

---

### U3 — `handleCredentialResponse` definido mas nunca chamado

**Problema:** `App.tsx:220–246` define o handler do Google GSI (fluxo legado). O login hoje usa Supabase OAuth via `triggerGoogleSignIn` em `HomeMenu.tsx`. O `fetchPlayerCurrency` dentro desse handler nunca executa — moedas não são carregadas em alguns fluxos de login.

**Plano de Ação:**
- Confirmar que `handleCredentialResponse` não aparece em nenhum JSX ou `useEffect`
- Deletar a função inteira
- Garantir que `fetchPlayerCurrency` é chamado no `onAuthStateChange` existente (`App.tsx:248`)

**Arquivos:** `App.tsx`

---

### U4 — `total_cards_played` não tipado → NaN silencioso no banco

**Problema:** `utils/supabase.ts:142` faz `existing.total_cards_played + params.totalCards`, mas o campo não está declarado na interface `RankingRow`. TypeScript não reclama; o valor vira `NaN` e vai ao banco como `NULL`.

**Plano de Ação:**
- Adicionar `total_cards_played: number` e `average_game_duration: number` à interface `RankingRow`
- As colunas já existem na tabela `card_game_rankings` (confirmado)
- Rodar `npm run build` para validar tipos

**Arquivos:** `utils/supabase.ts`

---

## 🔴 Crítico — Bugs que afetam usuários diretamente

### C1 — Banco compartilhado entre 5 aplicações sem isolamento

**Problema:** O projeto Supabase `hafxruwnggitvtyngedy` tem 48 tabelas de pelo menos 5 sistemas: Quiz de Jogadores, Jogo de Camisas, CMS/Notícias, Jogo de Pistas (Blueprints) e Cavaleiros Elementais. Sem separação por schema ou `app_id`. Um bug de query pode expor dados de outra aplicação; uma migration pode quebrar apps alheias.

**Plano de Ação (curto prazo — sem migração):**
- Documentar no `CLAUDE.md` as tabelas exclusivas do Cavaleiros: `card_game_rankings`, `cavaleiros_decks`, `element_cards`, `user_cards`, `user_decks`, `user_pack_openings`
- Adicionar comentário no topo de `utils/supabase.ts` listando as tabelas próprias
- Regra: nunca fazer `ALTER TABLE` em tabelas não listadas sem consultar os outros projetos

**Plano de Ação (médio prazo — migração recomendada):**
- Criar novo projeto Supabase dedicado ("cavaleiros-prod")
- Migrar as 6 tabelas do Cavaleiros + copiar dados de `card_game_rankings`
- Atualizar `.env.local` com as novas keys

**Arquivos:** `utils/supabase.ts`, `CLAUDE.md`, `.env.local`

---

### C2 — Loading states ausentes em toda a aplicação

**Problema:** `handleGoToRanking` é async e leva 1–2s. `triggerGoogleSignIn` redireciona externamente. `saveDeckToCloud` pode demorar. Nenhuma tela exibe indicador — o usuário clica e não sabe se funcionou.

**Plano de Ação:**
- Adicionar `isLoadingRanking: boolean` em `App.tsx`; ligar antes/depois do `fetchRanking`
- No `<Ranking>`, exibir spinner quando `isLoadingRanking` for `true`
- No `DeckEditor`, desabilitar "SALVAR" e mostrar "SALVANDO…" durante `saveDeckToCloud`
- No `Dashboard`, desabilitar botão de login enquanto OAuth processa

**Arquivos:** `App.tsx`, `components/Ranking.tsx`, `components/DeckEditor.tsx`, `components/Dashboard.tsx`

---

### C3 — Falhas do Supabase silenciosas para o usuário

**Problema:** `saveDeckToCloud`, `upsertGameResult`, `fetchPlayerCurrency` — todos com `try/catch` vazio ou apenas `console.error`. Progresso perdido sem aviso ao jogador.

**Plano de Ação:**
- Criar componente `Toast` leve para notificações de erro (bottom-left, 4s, estilo Aurum Sanctum)
- Fazer as funções em `utils/supabase.ts` retornarem `{ data, error }` explicitamente
- Em `App.tsx`, verificar o `error` e disparar toast: "Erro ao salvar progresso. Tente novamente."
- Priorizar: `upsertGameResult` (perda de moedas) e `saveDeckToCloud` (perda de baralho)

**Arquivos:** `utils/supabase.ts`, `App.tsx`, novo `components/Toast.tsx`

---

### C4 — Variável `deck` sombreada no timer

**Problema:** `App.tsx:347` declara `const deck = isPlayerTurn ? playerDeck : aiDeck` dentro de um `useEffect` que já tem `deck` (master deck) no escopo externo. Em modo Difícil, o timer pode referenciar o deck errado.

**Plano de Ação:**
- Renomear a variável local para `activeDeck` na linha 347
- Revisar outros `useEffect`s em busca do mesmo padrão

**Arquivos:** `App.tsx`

---

### C5 — Recompensas de missões declaradas mas nunca creditadas

**Problema:** `utils/quests.ts` define `rwd: '+120 Cosmo'` como string decorativa. Nenhum código em `App.tsx` lê esse valor e credita ao jogador. A missão aparece "concluída" mas o Cosmo não aumenta.

**Plano de Ação:**
- Adicionar campos `rewardCosmo: number` e `rewardPo?: number` na interface `Quest`
- Em `App.tsx`, após `incrementQuest`, checar se `progress === total`
- Se sim, chamar `awardCurrency({ cosmo: quest.rewardCosmo })` e atualizar estado local + banco

**Arquivos:** `utils/quests.ts`, `App.tsx`

---

## 🟡 Alta Prioridade — Arquitetura e UX

### A1 — `App.tsx` com 1000+ linhas: extrair hooks

**Problema:** Estado do jogo, lógica de IA, timer, persistência, auth, ranking e quests num único componente. Impossível testar partes isoladas; qualquer mudança tem blast radius alto.

**Plano de Ação:**
- Extrair `hooks/useGameEngine.ts` — timer, IA, `resolveRound`, `handleNextRound`, `startGame`
- Extrair `hooks/useAuth.ts` — login, logout, perfil, `onAuthStateChange`
- Extrair `hooks/usePlayerStats.ts` — currency, ranking, quests
- `App.tsx` fica responsável apenas por roteamento de telas + wiring dos hooks

**Arquivos:** `App.tsx`, novos `hooks/useGameEngine.ts`, `hooks/useAuth.ts`, `hooks/usePlayerStats.ts`

---

### A2 — Dois sistemas de roteamento paralelos em `App.tsx`

**Problema:** Algumas telas usam `if (gameState === X) return` antes do `switch` em `renderGameState()`; outras ficam dentro do `switch`. Inconsistência cria risco de estados silenciosamente não tratados.

**Plano de Ação:**
- Mover todos os `if (gameState === X) return` externos para dentro do `switch`
- Garantir que todo valor de `GameState` tem um `case` explícito; adicionar `default: return null`

**Arquivos:** `App.tsx`

---

### A3 — `DeckEditor` ignora cartas criadas pelo admin

**Problema:** `DeckEditor.tsx:17` importa `initialDeck` diretamente. Cartas criadas via `AdminPanel` nunca aparecem como opções no editor.

**Plano de Ação:**
- Adicionar prop `cardPool: CardData[]` ao `DeckEditor`
- Em `App.tsx`, passar `deck` (master deck, inclui cartas do admin) como `cardPool`
- Remover o import direto de `initialDeck` do `DeckEditor`

**Arquivos:** `components/DeckEditor.tsx`, `App.tsx`

---

### A4 — Dificuldade não afeta recompensas de moeda

**Problema:** `upsertGameResult` ignora o parâmetro `difficulty` no cálculo de `cosmoEarned`. Vencer no Difícil paga igual ao Fácil — remove o incentivo de progredir na dificuldade.

**Plano de Ação:**
- Em `utils/supabase.ts`, aplicar multiplicador: Fácil ×1.0, Normal ×1.5, Difícil ×2.0
- Exibir no `GameOver` o bônus de dificuldade ("Bônus Difícil: +100 Cosmo")

**Arquivos:** `utils/supabase.ts`, tela de GameOver

---

### A5 — `localStorage` sem namespace ou versionamento

**Problema:** Chaves `muted`, `savedGame`, `superTrunfoDeck`, `quests_YYYY-MM-DD` sem prefixo. Uma mudança de schema quebra usuários antigos silenciosamente; não há migração.

**Plano de Ação:**
- Criar `utils/storage.ts` com constantes prefixadas: `const KEYS = { muted: 'ce_v1_muted', savedGame: 'ce_v1_savedGame', deck: 'ce_v1_deck', ... }`
- Adicionar `migrateStorage()` que move chaves antigas para novas no primeiro acesso
- Substituir todos os `localStorage.getItem/setItem` espalhados pelas constantes de `KEYS`

**Arquivos:** novo `utils/storage.ts`, `App.tsx`, `components/DeckEditor.tsx`, `utils/quests.ts`

---

### A6 — Dados hardcoded no Dashboard criam confusão

**Problema:** 17 ocorrências de dados fictícios: `BRONZE III`, `LV 4`, `342 poder`, `SELENE · 9:14`, `KRATOS`, `NYX`. O usuário logado vê o próprio nome mas estatísticas de personagens inventados ao lado.

**Plano de Ação:**
- Substituir `RecentMatches` por dados reais do `matchHistory` (já existe em `App.tsx`)
- Substituir `FriendsRow` (SELENE, KRATOS, NYX) por componente oculto até existir backend de amizades
- Buscar `BRONZE III` / `LV 4` dos dados reais de `card_game_rankings`
- Campos sem dado real recebem `—` como placeholder em vez de número inventado

**Arquivos:** `components/Dashboard.tsx`, `App.tsx`

---

### A7 — `startGame()` falha silenciosamente sem login

**Problema:** `App.tsx:394` tem `if (!userProfile || deck.length < 2) return` sem feedback visual. O botão "BATALHA" aparece mas não faz nada para usuários não logados.

**Plano de Ação:**
- Desabilitar o botão "BATALHA" visualmente quando `!userProfile` (opacidade 0.5, `cursor: not-allowed`)
- Adicionar texto auxiliar "Faça login para jogar"
- Se `deck.length < 2`, exibir toast "Seu baralho precisa de pelo menos 2 cartas"

**Arquivos:** `components/Dashboard.tsx`, `App.tsx`

---

## 🟢 Média Prioridade — Melhorias de Produto e Game Design

### M1 — Tokens de cor duplicados em 5 arquivos

**Problema:** `#f4c349`, `#1a0e04`, `rgba(244,195,73,.X)` hardcoded em `App.tsx`, `Dashboard.tsx`, `Card.tsx`, `DeckEditor.tsx`, `HomeMenu.tsx`. Mudança de paleta exige busca global.

**Plano de Ação:**
- Criar `constants/theme.ts` com `COLORS: { gold: '#f4c349', dark: '#1a0e04', ... }` e variantes rgba
- Substituir ocorrências hardcoded nos 5 arquivos pelas constantes
- Manter como constantes TS (não CSS variables) para compatibilidade com inline styles

**Arquivos:** novo `constants/theme.ts`, `App.tsx`, `components/Dashboard.tsx`, `components/Card.tsx`, `components/DeckEditor.tsx`, `components/HomeMenu.tsx`

---

### M2 — Responsividade mobile incompleta no Dashboard

**Problema:** `RecentMatches` usa 6 colunas que esmagam em 320–375px. `FriendsRow` sem `flexWrap`. `ActiveDeck` com overflow horizontal sem scroll visível.

**Plano de Ação:**
- `RecentMatches`: trocar 6 colunas por grid de 2 colunas com 2 linhas por partida no mobile
- `FriendsRow`: adicionar `flexWrap: 'wrap'`
- `ActiveDeck` mobile: adicionar `overflowX: 'auto'` no container dos `DeckSlot`s

**Arquivos:** `components/Dashboard.tsx`

---

### M3 — Vantagem elemental invisível para iniciantes

**Problema:** O ciclo `Halogênio → Alcalino → Transição → Actinídeo → Gás Nobre → Halogênio` não é explicado durante o jogo. O badge "VANTAGEM ELEMENTAL" aparece sem contexto.

**Plano de Ação:**
- Na tela Playing, adicionar tooltip no badge de vantagem explicando "X vence Y porque…"
- Na Tela de Regras, adicionar diagrama visual do ciclo com setas entre grupos
- No primeiro jogo, exibir dica contextual quando a primeira vantagem ocorrer

**Arquivos:** `App.tsx` (tela Playing), `components/Rules.tsx`

---

### M4 — Moedas sem destino: loja de pacotes de cartas

**Problema:** Cosmo acumula no header mas não há nada para comprar. A motivação extrínseca se esgota após 3–4 partidas.

**Plano de Ação:**
- Criar tela `Shop` com 3 pacotes: Básico (100 Cosmo), Raro (300 Cosmo), Lendário (800 Cosmo)
- Cada pacote revela N cartas aleatórias com animação de abertura (estilo gacha)
- Registrar abertura na tabela `user_pack_openings` (já existe no banco)
- Cartas já possuídas convertem em Pó Cósmico em vez de duplicar

**Arquivos:** novo `components/Shop.tsx`, `App.tsx`, `utils/supabase.ts`

---

### M5 — Editor de deck sem restrições de game design

**Problema:** Jogador pode montar deck com 10 cartas + Super Trunfo e vencer trivialmente. Sem limitações, o editor é um sandbox sem consequências estratégicas.

**Plano de Ação:**
- Máximo 1 Super Trunfo por deck (validação no `DeckEditor`)
- Mínimo 2 grupos elementais diferentes
- Exibir indicador de "Poder Médio" (média dos atributos das cartas selecionadas)
- Botão "SALVAR" desabilitado enquanto deck não atende as restrições

**Arquivos:** `components/DeckEditor.tsx`

---

### M6 — Tela de Game Over sem síntese

**Problema:** Apenas "VITÓRIA"/"DERROTA" + 2 botões. Sem estatísticas da partida, sem reinforcement loop.

**Plano de Ação:**
- Exibir: rodadas jogadas, atributo mais vencedor da partida, Cosmo ganho
- Mostrar cartas restantes de cada jogador como preview visual
- Adicionar botão "Ver Histórico de Rodadas" que expande o `matchHistory`

**Arquivos:** `App.tsx` (renderização do GameOver)

---

### M7 — Missões diárias sem rotação ou notificação de reset

**Problema:** As 4 missões são sempre as mesmas. Sem sinal de "novas missões disponíveis" ao retornar no dia seguinte.

**Plano de Ação:**
- Ampliar `utils/quests.ts` com pool de 12+ missões, sorteando 4 diariamente com a data como seed
- No `Dashboard`, exibir badge "NOVO" quando reset ocorreu hoje e o usuário ainda não viu
- Marcar como vista no primeiro acesso ao Dashboard do dia

**Arquivos:** `utils/quests.ts`, `components/Dashboard.tsx`

---

### M8 — `ContinueBanner` com estado stale após fechamento brusco

**Problema:** Se o browser fechar durante `GameState.RoundResult`, o `savedGame` persiste com o estado de uma partida já terminada. O banner reaparece com dados inválidos.

**Plano de Ação:**
- Adicionar `timestamp`, `playerDeckSize` e `aiDeckSize` ao snapshot do `savedGame`
- Ao carregar, validar: se um deck tem 0 cartas, deletar `savedGame` automaticamente
- Expirar `savedGame` após 24h comparando `timestamp` com `Date.now()`

**Arquivos:** `App.tsx`

---

## ⬜ Baixa Prioridade — Polimento e Features Futuras

### B1 — Confirmação antes de salvar deck

**Problema:** "SALVAR" sobrescreve o baralho imediatamente sem "Tem certeza?". Não há undo.

**Plano de Ação:**
- Adicionar modal de confirmação: "Substituir baralho atual? Esta ação é irreversível."
- Alternativa: implementar "salvar como rascunho" com confirmação posterior

**Arquivos:** `components/DeckEditor.tsx`

---

### B2 — Som de urgência no timer

**Problema:** O `TimerRing` muda de cor ao chegar em ≤7s mas não há áudio de urgência.

**Plano de Ação:**
- Adicionar `playTimerWarning()` em `utils/sounds.ts` (3 pulsos curtos via Web Audio API)
- Disparar no `useEffect` do timer quando `timeLeft === 7`

**Arquivos:** `utils/sounds.ts`, `App.tsx`

---

### B3 — Cursor inconsistente em links usados como botões

**Problema:** `<a href="#">` em `Dashboard.tsx` e `HomeMenu.tsx` sem `role="button"` e sem `e.preventDefault()` consistente.

**Plano de Ação:**
- Substituir `<a href="#">` por `<button>` onde não há semântica de navegação
- Onde `<a>` é necessário, adicionar `role="button"` e `e.preventDefault()`

**Arquivos:** `components/Dashboard.tsx`, `components/HomeMenu.tsx`

---

### B4 — Tipografia sem fallback robusto

**Problema:** `fontFamily: 'Cinzel, serif'` — se o Google Fonts falhar (offline/lento), o fallback `serif` genérico altera completamente a estética do design.

**Plano de Ação:**
- Adicionar `<link rel="preload">` para Cinzel em `index.html`
- Adicionar `font-display: swap` na declaração `@import`
- Usar fallback explícito: `'Cinzel, "Times New Roman", serif'`

**Arquivos:** `index.html`

---

### B5 — `any` em pontos críticos de `App.tsx`

**Problema:** `App.tsx:62` (`google: any`), `App.tsx:153` (rows do Supabase), `App.tsx:248` (session do auth).

**Plano de Ação:**
- `google: any` → declarar `interface GoogleWindow` em `types.ts`
- Rows do Supabase → usar tipos gerados pelo Supabase CLI
- Session → usar `Session` de `@supabase/supabase-js`

**Arquivos:** `App.tsx`, `types.ts`

---

### B6 — Bundle inicial de 578kB com `initialDeck` inline

**Problema:** 118 cartas definidas inline em `initialDeck.ts` inflam o bundle principal desnecessariamente.

**Plano de Ação:**
- Opção A: converter para `initialDeck.json` e usar import dinâmico
- Opção B (preferida): carregar cartas diretamente da tabela `element_cards` no Supabase (já contém todas as 118 cartas com atributos) e eliminar o arquivo local

**Arquivos:** `initialDeck.ts`, `App.tsx`

---

### B7 — Imagens Personalizadas para as Cartas

**Problema:** Cartas usam imagens genéricas do `picsum.photos` sem relação com os Cavaleiros Elementais.

**Plano de Ação:**
- Criar ilustrações para os 118 cavaleiros (ou contratar artista)
- Hospedar em Supabase Storage ou CDN
- Atualizar `imageUrl` nas cartas do banco

**Arquivos:** `utils/supabase.ts`, banco `element_cards`

---

### B8 — Modo Torneio

Suporte a brackets de eliminatória com múltiplos jogadores online.

---

### B9 — PWA / Suporte Offline

Configurar service worker para jogar sem conexão. Requer substituição das imagens do picsum por assets locais primeiro.

---

### B10 — Testes Automatizados

- Testes unitários para `shuffleDeck`, `getAdvantage`, lógica de `handleAttributeSelect`
- Testes de integração para o fluxo completo de uma partida

---

## ✅ Concluído

- [x] Estrutura base do jogo (baralho, rodadas, vitória/derrota)
- [x] 118 cartas mapeando a Tabela Periódica completa
- [x] Sistema de Vantagem Elemental com bônus de 20%
- [x] Carta Super Trunfo (Oganesson)
- [x] Login com Google OAuth 2.0
- [x] Painel de Administrador (CRUD de cartas)
- [x] Persistência do baralho em `localStorage`
- [x] Animações de flip de carta (CSS 3D)
- [x] Feedback visual de vitória (pulse) e derrota (shake + grayscale)
- [x] Estilos visuais diferenciados por grupo de elemento
- [x] IA automática (escolhe melhor atributo com vantagem elemental, delay de 1.4s)
- [x] Logout (botão SAIR no header, revoga sessão Google)
- [x] Design Aurum Sanctum em todas as telas (HomeMenu, Dashboard, Playing, RoundResult, GameOver, Ranking, AdminPanel, Collection)
- [x] **Dificuldades de IA** — Fácil (aleatório), Normal (maior bruto), Difícil (considera vantagem elemental)
- [x] **Modo Multiplayer Local** — 2 jogadores no mesmo dispositivo; carta do J2 fica face-up na vez dele
- [x] **Histórico de Partida** — últimas 5 rodadas exibidas na tela de batalha (atributo, cartas, placar)
- [x] **Tela de Regras** — tutorial acessível a partir do menu e dashboard, explica ciclo elemental, atributos, Super Trunfo e dificuldades
- [x] **Efeitos Sonoros** — Web Audio API para flip, vitória/derrota de rodada e vitória/derrota de jogo
- [x] **Configurações em Variáveis de Ambiente** — `ADMIN_EMAIL` e `GOOGLE_CLIENT_ID` movidos para `.env.local`
- [x] **Mute de Som** — botão ♪ no Dashboard persiste preferência em `localStorage`
- [x] **Busca e Filtro na Coleção** — input de busca, sort e filtros de status funcionais
- [x] **Continue Banner** — persiste estado da partida entre navegações; banner exibe dados reais
- [x] **Missões Diárias** — 4 missões com progresso real rastreado em `localStorage`, reset diário
- [x] **Moedas (Cosmo/Pó)** — ganhos por partida persistidos no Supabase, exibidos no Dashboard
- [x] **Editor de Baralho para Jogadores** — seleção de 10–30 cartas com prévia e persistência na nuvem
- [x] **Animação de Transferência de Cartas** — cartas se movem visualmente entre baralhos após resultado
- [x] **Ranking com Persistência** — dados reais do Supabase (`card_game_rankings`), ordenado por score
