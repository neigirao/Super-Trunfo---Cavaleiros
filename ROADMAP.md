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

---

## 🔐 Segurança — Achados da Auditoria (maio/2026)

> Itens descobertos na auditoria de segurança realizada após o MVP. Severidade independente das prioridades funcionais acima; itens marcados 🔥 devem ser resolvidos antes de qualquer usuário externo acessar o sistema em produção.

### S1 — RLS (Row Level Security) desativado em todas as tabelas 🔥

**Problema:** Nenhuma política de RLS está ativa nas tabelas `card_game_rankings`, `cavaleiros_decks`, `element_cards`, `profiles`. O `anon key` público do Supabase permite que qualquer pessoa leia e escreva dados diretamente via REST API sem autenticação — bastam as credenciais do `index.html`.

**Vetor de ataque:** `curl -H "apikey: ANON_KEY" https://SUPABASE_URL/rest/v1/card_game_rankings` retorna todos os registros de todos os jogadores.

**Plano de Ação:**
```sql
-- Executar no Supabase SQL Editor
ALTER TABLE card_game_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_rows" ON card_game_rankings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public_read_ranking" ON card_game_rankings
  FOR SELECT USING (true);

ALTER TABLE cavaleiros_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_decks" ON cavaleiros_decks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Arquivos:** Supabase Dashboard → Table Editor → RLS

---

### S2 — GEMINI_API_KEY exposta no bundle JavaScript de produção 🔥

**Problema:** `vite.config.ts:8-9` injeta `GEMINI_API_KEY` via `define: { 'process.env.GEMINI_API_KEY': ... }`. Essa substituição acontece em tempo de build, embutindo a chave literalmente no `dist/assets/index-*.js`. Qualquer pessoa pode abrir o DevTools e extrair a chave.

**Vetor de ataque:** `grep -o '"AIza[^"]*"' dist/assets/index-*.js` ou DevTools → Sources → busca "AIza".

**Plano de Ação:**
1. Remover as linhas `define` de `vite.config.ts:8-9`
2. Se Gemini for usado no futuro, criar Edge Function no Supabase que faz proxy das chamadas (chave fica no servidor)
3. Revogar a chave atual no Google Cloud Console e gerar nova

**Arquivos:** `vite.config.ts`

---

### S3 — Autorização de Admin exclusivamente no frontend

**Problema:** `App.tsx` verifica `userProfile.email === ADMIN_EMAIL` para mostrar o painel de admin, mas essa lógica está inteiramente no cliente. Qualquer pessoa pode modificar o estado local (React DevTools) para ganhar acesso ao `AdminPanel` e criar/editar/deletar cartas do banco sem restrição server-side.

**Vetor de ataque:** React DevTools → buscar componente App → editar `isAdmin` para `true`.

**Plano de Ação:**
1. Criar política RLS no Supabase para a tabela `element_cards`:
   ```sql
   CREATE POLICY "admin_write" ON element_cards
     FOR ALL USING (auth.jwt() ->> 'email' = 'neigirao@gmail.com');
   ```
2. Adicionar verificação server-side via Supabase Function ou Edge Function antes de qualquer mutação de carta
3. Manter verificação frontend apenas como UX (esconder botão), não como segurança real

**Arquivos:** `App.tsx`, Supabase Dashboard

---

### S4 — Sem Content Security Policy (CSP)

**Problema:** `index.html` não define header `Content-Security-Policy`. O app carrega scripts de 4 origens externas (`cdn.tailwindcss.com`, `esm.sh`, `accounts.google.com`, `fonts.googleapis.com`) sem whitelist. Se qualquer CDN for comprometida (supply chain attack), scripts maliciosos serão executados no contexto do jogo com acesso ao token de sessão do Supabase.

**Plano de Ação:**
```html
<!-- Adicionar em index.html <head> -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.tailwindcss.com https://esm.sh https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://picsum.photos https://lh3.googleusercontent.com;
  connect-src 'self' https://*.supabase.co;
">
```

**Arquivos:** `index.html`

---

### S5 — Sem Subresource Integrity (SRI) em scripts externos

**Problema:** `<script src="https://cdn.tailwindcss.com">` e imports do `esm.sh` não usam `integrity="sha384-..."`. Se o CDN servir uma versão modificada do script, o browser a executa sem aviso.

**Plano de Ação:**
1. Migrar Tailwind para dependência local (`npm install tailwindcss`) e compilar no build (resolve CDN + SRI em um passo)
2. Migrar React/ReactDOM de `esm.sh` para bundle local via Vite (já estão em `package.json` como deps)
3. Para scripts que permanecerem externos, gerar hash SRI: `openssl dgst -sha384 -binary script.js | openssl base64 -A`

**Arquivos:** `index.html`, `vite.config.ts`

---

### S6 — Token de sessão exposto via `console.log` implícito

**Problema:** `utils/supabase.ts:36` e `:108` usam `console.error()` com objetos de erro que podem conter tokens parciais ou metadados de sessão. Em produção, ferramentas de log externas (Datadog, Papertrail) capturariam esses logs incluindo dados sensíveis.

**Plano de Ação:**
1. Em produção (`import.meta.env.PROD`), substituir `console.error` por chamada silenciosa ao Sentry
2. Nunca logar o objeto de erro inteiro — apenas `error.message`

**Arquivos:** `utils/supabase.ts`

---

## ⚡ Performance — Achados da Auditoria (maio/2026)

> Impactos medidos via análise estática do build. TTI = Time to Interactive, LCP = Largest Contentful Paint.

### P1 — Tailwind carregado via CDN síncrono (bloqueante) 🔥

**Problema:** `index.html:8` tem `<script src="https://cdn.tailwindcss.com">` sem `defer` ou `async`. O browser para de processar o HTML e espera o download do script (~80KB) antes de continuar — bloqueia o render da primeira tela.

**Impacto estimado:** LCP +300–500ms em 4G; +1–2s em 3G.

**Plano de Ação:**
1. Instalar Tailwind como dependência: `npm install -D tailwindcss`
2. Criar `tailwind.config.js` e `postcss.config.js`
3. Remover `<script src="https://cdn.tailwindcss.com">` do `index.html`
4. Importar Tailwind no CSS: criar `src/index.css` com `@tailwind base; @tailwind components; @tailwind utilities;`
5. Importar o CSS em `index.tsx`

**Arquivos:** `index.html`, novo `tailwind.config.js`, `index.tsx`

---

### P2 — React carregado via `esm.sh` (sem controle de bundle, sem cache)

**Problema:** `index.html:92-98` define importmap apontando React para `https://esm.sh/react@^19.1.1`. Cada deploy pode resolver uma versão diferente (`^`). Sem `package-lock` cobrindo essa resolução. Cache do browser é da URL do esm.sh, não do seu domínio — expiração imprevisível. Duas requisições de rede extras antes do app inicializar.

**Impacto estimado:** TTI +400–800ms por falta de bundle único otimizado.

**Plano de Ação:**
1. Remover o bloco `<script type="importmap">` do `index.html`
2. React já está em `package.json` — o Vite já o empacota. Garantir que `index.tsx` não faz import de URL
3. Rodar `npm run build` e verificar que React está no bundle local (`dist/assets/index-*.js`)

**Arquivos:** `index.html`, `index.tsx`

---

### P3 — `initialDeck.ts` com 118 cartas inline no bundle principal

**Problema:** `initialDeck.ts` define ~118 objetos com 6 atributos cada e uma URL de imagem. Esse arquivo é importado estaticamente em `App.tsx` e vai inteiro no bundle principal. Jogadores que nunca constroem um deck customizado pagam o custo de parse de ~35KB de dados que não usarão naquela sessão.

**Impacto estimado:** +15–25ms de parse time; +35KB no bundle principal.

**Plano de Ação (preferida):** Carregar cartas da tabela `element_cards` no Supabase (já existe, já tem os 118 elementos com atributos). Eliminar `initialDeck.ts` completamente.

**Plano de Ação (alternativo):** Converter para `initialDeck.json` + dynamic import:
```typescript
const { default: initialDeck } = await import('./initialDeck.json');
```

**Arquivos:** `initialDeck.ts`, `App.tsx`

---

### P4 — localStorage sincronizado sem debounce a cada mudança de deck

**Problema:** `App.tsx:172-179` tem dois `useEffect` que disparam em cascata a cada mudança em `deck`: um salva no localStorage (síncrono, bloqueia main thread ~15ms), outro chama `saveDeckToCloud` (request HTTP). Durante o jogo, o deck muda a cada rodada — cada transferência de carta aciona ambos.

**Plano de Ação:**
```typescript
// Debounce de 2s para localStorage, 5s para Supabase
const saveDeckDebounced = useMemo(
  () => debounce((d: CardData[]) => {
    localStorage.setItem('ce_v1_deck', JSON.stringify(d));
    if (userProfile) saveDeckToCloud(d);
  }, 2000),
  [userProfile]
);
useEffect(() => { saveDeckDebounced(deck); }, [deck]);
```

**Arquivos:** `App.tsx`

---

### P5 — Sem code splitting: bundle único de 555KB

**Problema:** `vite.config.ts` não configura `build.rollupOptions.output.manualChunks`. O Vite gera um único `index-*.js` de 555KB. Usuários que visitam apenas o menu principal baixam código de AdminPanel, Collection, DeckEditor sem precisar.

**Plano de Ação:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', '@supabase/supabase-js'],
        admin: ['./components/AdminPanel.tsx'],
        collection: ['./components/Collection.tsx'],
        deckEditor: ['./components/DeckEditor.tsx'],
      }
    }
  }
}
```

**Arquivos:** `vite.config.ts`

---

### P6 — Sem React.memo / useCallback nos componentes pesados

**Problema:** `Dashboard`, `Card`, `Collection` re-renderizam a cada mudança de qualquer estado em `App.tsx` (13 `useState`). Em modo Playing, `timeLeft` decrementa a cada segundo causando re-render total da árvore.

**Plano de Ação:**
1. Envolver `Dashboard`, `Ranking`, `Collection`, `AdminPanel` em `React.memo()`
2. Todos os callbacks passados como props (handlers de atributo, handlers de navegação) em `useCallback`
3. Tirar `timeLeft` do estado de `App` para um hook isolado `useTimer` que renderiza apenas o componente `TimerRing`

**Arquivos:** `App.tsx`, `components/Dashboard.tsx`, `components/Card.tsx`, `components/Collection.tsx`

---

### P7 — Sourcemaps habilitados em produção (vazamento de código)

**Problema:** `vite.config.ts` não define `build.sourcemap: false`. O Vite gera sourcemaps por padrão dependendo da versão — se gerados em produção, o código TypeScript original fica acessível via DevTools, facilitando engenharia reversa da lógica do jogo e extração de strings sensíveis.

**Plano de Ação:**
```typescript
build: { sourcemap: false } // ou: sourcemap: mode === 'development'
```

**Arquivos:** `vite.config.ts`

---

### P8 — Google Fonts bloqueia render (FOUT sem font-display)

**Problema:** `index.html:9-11` tem preconnect para Google Fonts (correto), mas a stylesheet carregada não especifica `font-display: swap`. Cinzel e Spectral bloqueiam renderização de texto até o download das fontes — usuário vê tela em branco ou sem texto.

**Plano de Ação:**
```html
<!-- Adicionar &display=swap na URL do Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&...&display=swap" rel="stylesheet">
```

**Arquivos:** `index.html`

---

## 📋 Legal & Compliance (LGPD/GDPR) — Achados da Auditoria

> Itens com risco jurídico direto. O jogo coleta dados pessoais (nome, email, foto Google, histórico de partidas) de usuários brasileiros — LGPD (Lei 13.709/2018) é aplicável.

### L1 — Ausência de Política de Privacidade 🔥

**Problema:** O app coleta nome completo, email e foto via Google OAuth e armazena histórico de partidas e preferências no Supabase. Não existe nenhum link ou documento de Política de Privacidade. Isso viola o Art. 9º da LGPD (dever de informação) e os Termos de Serviço do Google OAuth (exigem link para privacy policy visível na tela de login).

**Plano de Ação:**
1. Criar `/public/privacidade.html` com: quais dados são coletados, por quê, por quanto tempo, com quem compartilhados, direitos do titular
2. Adicionar link visível na tela de login (HomeMenu) antes do botão "Entrar com Google"
3. Link no rodapé do Dashboard

**Arquivos:** novo `/public/privacidade.html`, `components/HomeMenu.tsx`, `components/Dashboard.tsx`

---

### L2 — Consentimento não solicitado antes do OAuth 🔥

**Problema:** O botão "ENTRAR COM GOOGLE" inicia o fluxo OAuth imediatamente sem informar o usuário sobre os dados coletados ou obter consentimento. O Art. 7º da LGPD exige que o tratamento de dados pessoais tenha base legal — para jogo casual (sem contrato), a base é consentimento, que deve ser livre, informado e inequívoco.

**Plano de Ação:**
1. Antes de chamar `triggerGoogleSignIn`, exibir modal/checkbox: "Ao continuar, você concorda com nossa [Política de Privacidade] e consente com o tratamento dos seus dados para fins de jogo."
2. Salvar timestamp do consentimento em `card_game_rankings.consent_at` (nova coluna)
3. Botão "ENTRAR" desabilitado até checkbox marcado

**Arquivos:** `components/HomeMenu.tsx`, Supabase (nova coluna)

---

### L3 — Ausência de mecanismo de exclusão de conta (direito ao esquecimento)

**Problema:** Art. 18, IV da LGPD garante ao titular o direito de solicitar eliminação dos dados pessoais. O app não oferece nenhum botão ou fluxo de "Excluir minha conta e dados".

**Plano de Ação:**
1. Adicionar botão "Excluir minha conta" nas configurações do Dashboard
2. Ao confirmar, executar: `DELETE FROM card_game_rankings WHERE user_id = auth.uid()` e `DELETE FROM cavaleiros_decks WHERE user_id = auth.uid()`, depois `supabase.auth.admin.deleteUser(uid)`
3. Exibir confirmação "Seus dados foram removidos permanentemente"

**Arquivos:** `components/Dashboard.tsx`, `utils/supabase.ts`

---

### L4 — Sem Termos de Uso

**Problema:** Sem documento definindo as regras de uso do jogo: comportamento esperado, proibições (cheating, automação), responsabilidade por conteúdo, lei aplicável para resolução de disputas.

**Plano de Ação:**
1. Criar `/public/termos.html` com termos simplificados
2. Linkar junto com a Política de Privacidade no fluxo de consentimento

**Arquivos:** novo `/public/termos.html`, `components/HomeMenu.tsx`

---

## 🔍 SEO & Visibilidade

> O jogo é uma SPA sem SSR — bots de busca veem apenas o `index.html` vazio antes de executar JavaScript. Isso limita severamente a indexação orgânica.

### SEO1 — Meta description ausente

**Problema:** `index.html` tem `<title>` mas sem `<meta name="description">`. Google usa a description no snippet da SERP. Sem ela, o algoritmo extrai texto aleatório do conteúdo, geralmente pobre.

**Plano de Ação:**
```html
<meta name="description" content="Cavaleiros dos Elementos: um jogo de cartas que transforma a Tabela Periódica em campo de batalha. Construa seu baralho, aposte atributos químicos e vença a IA. Grátis, no browser.">
```

**Arquivos:** `index.html`

---

### SEO2 — Open Graph e Twitter Card ausentes

**Problema:** Quando o link é compartilhado no WhatsApp, Twitter ou Discord, o preview mostra apenas o domínio sem imagem ou descrição — taxa de clique cai ~60%.

**Plano de Ação:**
```html
<meta property="og:title" content="Cavaleiros dos Elementos">
<meta property="og:description" content="A Tabela Periódica como campo de batalha.">
<meta property="og:image" content="https://[dominio]/og-cover.png">
<meta property="og:url" content="https://[dominio]/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```
Criar `og-cover.png` (1200×630px) com arte do jogo.

**Arquivos:** `index.html`, `public/og-cover.png`

---

### SEO3 — robots.txt e sitemap.xml ausentes

**Problema:** Sem `robots.txt`, o Google Disallow padrão pode bloquear rotas. Sem `sitemap.xml`, o bot não sabe quais URLs priorizar (relevante quando SSR/SSG for implementado).

**Plano de Ação:**
Criar `/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://[dominio]/sitemap.xml
```
Criar `/public/sitemap.xml` básico com a URL raiz.

**Arquivos:** `public/robots.txt`, `public/sitemap.xml`

---

### SEO4 — Structured Data (JSON-LD) ausente

**Problema:** Google Search entende jogos melhor com Schema.org `Game`. Sem isso, o resultado de busca não qualifica para rich snippets (avaliações, gênero, plataforma).

**Plano de Ação:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Cavaleiros dos Elementos",
  "description": "Jogo de cartas com elementos da Tabela Periódica",
  "genre": "Card Game",
  "gamePlatform": "Web Browser",
  "operatingSystem": "Any",
  "applicationCategory": "Game",
  "isAccessibleForFree": true
}
</script>
```

**Arquivos:** `index.html`

---

## 🤖 SEO de IA (LLM Search Optimization)

> Motores de busca como Perplexity, ChatGPT Search, Google AI Overviews e Claude.ai citam fontes quando respondem perguntas. Para aparecer nessas citações ("jogo de cartas da tabela periódica"), o conteúdo precisa ser rastreável e estruturado.

### AISO1 — SPA sem conteúdo rastreável por LLMs

**Problema:** O app inteiro reside em `App.tsx` renderizado no cliente. Quando um crawler de LLM visita o domínio, recebe `<div id="root"></div>` vazio. Nenhum texto sobre o jogo, regras, elementos ou mecânicas está disponível no HTML estático — impossível de indexar, impossível de citar.

**Impacto:** Zero probabilidade de aparecer em respostas de AI Search para queries como "jogo de cartas tabela periódica" ou "super trunfo elementos químicos".

**Plano de Ação (curto prazo):**
1. Adicionar ao `index.html` um bloco `<noscript>` com descrição textual completa do jogo, mecânicas e lista de elementos — visível para crawlers sem JS
2. Criar `/public/sobre.html` (página estática) com conteúdo rico: regras, lista de cavaleiros, atributos explicados — linkada no `index.html`

**Plano de Ação (médio prazo):**
1. Avaliar SSG (Static Site Generation) via Vite + prerender para gerar HTML estático das telas principais (HomeMenu, Regras)
2. Configurar `vite-plugin-prerender` ou migrar para Astro/Next.js para as páginas de conteúdo

**Arquivos:** `index.html`, novo `public/sobre.html`

---

### AISO2 — Conteúdo sem FAQ estruturado

**Problema:** Perguntas como "como funciona a vantagem elemental?" ou "o que é Super Trunfo no jogo de cavaleiros?" são frequentes e têm alta intenção de engajamento. Sem página de FAQ com Schema.org `FAQPage`, essas perguntas são respondidas pela IA com conteúdo de outros sites.

**Plano de Ação:**
1. Criar seção FAQ na página `/public/sobre.html` com Schema.org `FAQPage`
2. Perguntas sugeridas: "Como funciona a vantagem elemental?", "O que é Super Trunfo?", "Quais são os 5 atributos das cartas?", "Como montar um baralho?", "Posso jogar sem login?"
3. Incluir respostas completas com a terminologia do jogo

**Arquivos:** `public/sobre.html`

---

### AISO3 — Nenhum link externo aponta para o jogo (autoridade zero)

**Problema:** LLMs priorizam fontes com autoridade de domínio (backlinks). Um jogo sem nenhum link externo apontando para ele tem autoridade próxima de zero para qualquer motor de busca ou LLM retrieval.

**Plano de Ação (marketing, não técnico):**
1. Publicar o jogo em plataformas de curadoria: itch.io, Newgrounds, GameJolt (com link para o domínio)
2. Post no Reddit r/WebGames, r/tabletopgamedesign com link e explicação
3. Se possível, artigo educacional em blog de química/ciência citando o jogo
4. Criar perfil GitHub Pages do projeto com README rico e link para o app

**Arquivos:** `README.md`, `public/sobre.html`

---

### AISO4 — Nome do jogo não está em domínio próprio memorável

**Problema:** Se o app estiver hospedado em subdomínio genérico (ex: `projeto.vercel.app`), LLMs não associam o nome "Cavaleiros dos Elementos" ao domínio. Buscas por "site:projeto.vercel.app" retornam zero resultados úteis para AI Overviews.

**Plano de Ação:**
1. Registrar domínio: `cavaleirosdeelementos.com.br` ou `cavaleiros-elementais.app`
2. Configurar DNS apontando para o host atual
3. Atualizar canonical URL, OG tags e sitemap com o novo domínio

**Arquivos:** `index.html`, `public/robots.txt`, `public/sitemap.xml`

---

## 🏗️ DevOps & Monitoramento — Achados da Auditoria

### D1 — Nenhum pipeline de CI/CD configurado 🔥

**Problema:** Não existe `.github/workflows/`, `vercel.json`, `netlify.toml` ou qualquer automação de deploy. O processo atual é presumidamente: `git push` → deploy manual. Sem verificação automática de tipos ou build antes do deploy — código quebrado pode ir para produção.

**Plano de Ação:**
Criar `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit   # typecheck
      - run: npm run build       # build
```

**Arquivos:** novo `.github/workflows/ci.yml`

---

### D2 — TypeScript strict mode desativado

**Problema:** `tsconfig.json` não tem `"strict": true`. Isso desativa: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`. O código aceita `any` implícito, `null` sem verificação, funções com assinaturas incompatíveis — sem erro de compilação.

**Impacto:** Bugs como o `total_cards_played` NaN (item U4) e sombra de variável `deck` (item C4) são possíveis e passam despercebidos.

**Plano de Ação:**
1. Adicionar `"strict": true` ao `tsconfig.json`
2. Corrigir erros que surgirem (esperar 20–50 erros no primeiro passo)
3. Adicionar `"noUnusedLocals": true, "noUnusedParameters": true`

**Arquivos:** `tsconfig.json`

---

### D3 — Sem error tracking em produção (Sentry)

**Problema:** Erros de runtime em produção vão para `console.error` que ninguém monitora. Quando um usuário encontra um bug, não há como saber a frequência, o stack trace ou o contexto da sessão.

**Plano de Ação:**
1. Criar conta gratuita no Sentry (sentry.io)
2. `npm install @sentry/react`
3. Inicializar em `index.tsx`:
   ```typescript
   import * as Sentry from '@sentry/react';
   Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE });
   ```
4. Substituir `console.error` em `utils/supabase.ts` por `Sentry.captureException(error)`

**Arquivos:** `index.tsx`, `utils/supabase.ts`, `.env.local`

---

### D4 — Sem ambiente de staging

**Problema:** Não existe `.env.staging` nem projeto Supabase separado para staging. Qualquer teste de nova feature que envolva banco de dados acontece em produção — risco de corrupção de dados de usuários reais.

**Plano de Ação:**
1. Criar projeto Supabase de staging (plano free cobre isso)
2. Criar `.env.staging` com as keys do projeto de staging
3. Adicionar script `"preview:staging": "vite preview --mode staging"` ao `package.json`
4. Antes de qualquer deploy, testar no staging com a mesma build

**Arquivos:** `.env.staging`, `package.json`

---

### D5 — Scripts de qualidade ausentes no package.json

**Problema:** `package.json` só tem `dev`, `build`, `preview`. Sem `typecheck`, `lint`, `test`. Isso torna impossível automatizar verificações de qualidade no CI ou no pre-commit.

**Plano de Ação:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives",
  "test": "vitest run"
}
```
Instalar: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin vitest`

**Arquivos:** `package.json`

---

### D6 — Sem monitoramento de uptime ou alertas

**Problema:** Se o Supabase ou o host do frontend cair, ninguém é notificado automaticamente. O downtime só é descoberto quando um usuário reclama.

**Plano de Ação:**
1. Criar monitor gratuito no UptimeRobot (5-minute checks, free tier)
2. Configurar alerta por email para `neigirao@gmail.com`
3. Opcionalmente: integrar Supabase Health endpoint ao monitor

**Arquivos:** Configuração externa (UptimeRobot dashboard)

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
