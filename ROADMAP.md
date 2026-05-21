# Roadmap — Super Trunfo: Cavaleiros Elementais

Este documento lista as melhorias planejadas, agrupadas por prioridade.

---

## Em Andamento / Pendente (bugs e lacunas do MVP)

### IA Passiva
**Problema:** Quando `isPlayerTurn = false`, o jogo trava aguardando a próxima rodada. A IA nunca escolhe um atributo automaticamente.

**Solução esperada:** Implementar `useEffect` que, quando `!isPlayerTurn`, escolhe automaticamente o melhor atributo da carta da IA (ou um aleatório para dificuldade fácil) com um pequeno delay para simular "pensamento".

---

### Ranking sem Persistência
**Problema:** `<Ranking rankingData={[]} />` — a interface existe mas nunca exibe dados reais.

**Solução esperada:** Integrar com um backend (Supabase, Firebase, ou API própria) para registrar vitórias e pontuação por usuário autenticado.

---

### Gemini API não utilizada
**Problema:** `vite.config.ts` expõe `GEMINI_API_KEY` e o README original menciona a chave, mas não há nenhum uso no código.

**Possível uso:** Geração de descrições/lore para as cartas, narrativa dinâmica de batalha, ou uma IA mais avançada que usa o modelo para escolher atributos.

---

## Melhorias de Alta Prioridade

### Dificuldades de IA
- **Fácil:** IA escolhe atributo aleatório
- **Normal:** IA escolhe o melhor atributo disponível
- **Difícil:** IA considera a vantagem elemental ao escolher

### Modo Multiplayer Local
Permitir que dois jogadores joguem no mesmo dispositivo, alternando o controle entre rodadas.

### Configurações em Variáveis de Ambiente
Mover `ADMIN_EMAIL` e `GOOGLE_CLIENT_ID` de `App.tsx` para `.env.local`, evitando valores hard-coded no código-fonte.

```env
VITE_GOOGLE_CLIENT_ID=...
VITE_ADMIN_EMAIL=...
```

---

## Melhorias de Média Prioridade

### Imagens Personalizadas para as Cartas
Substituir as imagens genéricas do `picsum.photos` por ilustrações próprias dos Cavaleiros Elementais.

### Efeitos Sonoros
Adicionar sons para:
- Flip de carta
- Vitória de rodada
- Derrota de rodada
- Vitória/derrota de jogo

### Animação de Transferência de Cartas
Exibir visualmente as cartas se movendo de um baralho para o outro após o resultado da rodada.

### Histórico de Partida
Exibir um log das últimas rodadas jogadas durante a partida (atributo escolhido, vencedor, cartas envolvidas).

### Tela de Regras
Adicionar tela de tutorial/regras acessível a partir do Menu principal explicando o sistema de vantagens elementais.

---

## Melhorias de Baixa Prioridade / Futuras

### Backend e Autenticação Robusta
- Substituir decodificação manual do JWT por verificação server-side
- Persistir baralho personalizado por usuário no banco (hoje é só `localStorage`)

### Editor de Baralho para Jogadores
Permitir que jogadores (não só admins) montem baralhos customizados a partir das cartas disponíveis.

### Modo Torneio
Suporte a brackets de eliminatória com múltiplos jogadores.

### PWA / Suporte Offline
Configurar service worker para permitir jogar sem conexão (as imagens do picsum precisariam ser substituídas por assets locais primeiro).

### Testes Automatizados
- Testes unitários para `shuffleDeck`, `getAdvantage`, lógica de `handleAttributeSelect`
- Testes de integração para o fluxo completo de uma partida

---

## Concluído

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
