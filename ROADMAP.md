# Roadmap — Super Trunfo: Cavaleiros Elementais

Este documento lista as melhorias planejadas, agrupadas por prioridade.

---

## Em Andamento / Pendente (bugs e lacunas do MVP)

### Ranking sem Persistência
**Problema:** `<Ranking rankingData={[]} />` — a interface existe mas nunca exibe dados reais.

**Solução esperada:** Integrar com um backend (Supabase, Firebase, ou API própria) para registrar vitórias e pontuação por usuário autenticado.

---

## Melhorias de Alta Prioridade

### Imagens Personalizadas para as Cartas
Substituir as imagens genéricas do `picsum.photos` por ilustrações próprias dos Cavaleiros Elementais.

---

## Melhorias de Média Prioridade

### Animação de Transferência de Cartas
Exibir visualmente as cartas se movendo de um baralho para o outro após o resultado da rodada.

---

## Melhorias de Baixa Prioridade / Futuras

### Backend e Autenticação Robusta
- Substituir decodificação manual do JWT por verificação server-side
- Persistir baralho customizado por usuário no banco (hoje é só `localStorage`)

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
- [x] IA automática (escolhe melhor atributo com vantagem elemental, delay de 1.4s)
- [x] Logout (botão SAIR no header, revoga sessão Google)
- [x] Design Aurum Sanctum em todas as telas (HomeMenu, Dashboard, Playing, RoundResult, GameOver, Ranking, AdminPanel, Collection)
- [x] **Dificuldades de IA** — Fácil (aleatório), Normal (maior bruto), Difícil (considera vantagem elemental)
- [x] **Modo Multiplayer Local** — 2 jogadores no mesmo dispositivo; carta do J2 fica face-up na vez dele
- [x] **Histórico de Partida** — últimas 5 rodadas exibidas na tela de batalha (atributo, cartas, placar)
- [x] **Tela de Regras** — tutorial acessível a partir do menu e dashboard, explica ciclo elemental, atributos, Super Trunfo e dificuldades
- [x] **Efeitos Sonoros** — Web Audio API para flip, vitória/derrota de rodada e vitória/derrota de jogo
- [x] **Configurações em Variáveis de Ambiente** — `ADMIN_EMAIL` e `GOOGLE_CLIENT_ID` movidos para `.env.local`
