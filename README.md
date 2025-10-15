# Card Battle Game - Super Trunfo dos Elementos

Um jogo de cartas estratégico baseado nas regras clássicas do Super Trunfo, onde cavaleiros dos elementos batalham usando suas características únicas.

## 🎮 Como Jogar

### Regras Básicas (Super Trunfo)

1. **Início da Partida**
   - Cada jogador monta um baralho com no mínimo 6 cartas
   - Os baralhos são embaralhados automaticamente
   - O jogador sempre começa escolhendo o primeiro atributo

2. **Durante a Rodada**
   - Ambos jogadores revelam uma carta do topo do baralho
   - O jogador da vez escolhe um atributo para comparação
   - Os atributos disponíveis são:
     - **Número Atômico** (atomic_number)
     - **Massa Atômica** (atomic_mass)
     - **Densidade** (density)
     - **Ponto de Fusão** (melting_point)
     - **Reatividade** (reactivity)
     - **Radioatividade** (radioactivity)

3. **Resultado da Rodada**
   - **Vitória**: O jogador com maior valor no atributo escolhido vence
   - **Empate**: Cartas vão para uma pilha de descarte
   - O vencedor leva **AMBAS** as cartas (sua carta + carta do oponente)
   - Em caso de empate subsequente, o próximo vencedor leva todas as cartas do descarte

4. **Fim de Jogo**
   - O jogo termina quando um jogador **fica sem cartas**
   - Quem tem cartas restantes é o vencedor
   - Pontuação e estatísticas são salvas no ranking

### Super Trunfo Especial
Algumas cartas possuem a habilidade **Super Trunfo**:
- Vencem automaticamente contra cartas normais
- Possuem uma fraqueza específica (outro elemento)
- Se enfrentar sua fraqueza, perde automaticamente

## 🚀 Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Supabase** - Backend (Database + Auth + Storage)
- **React Query** - Cache de dados
- **Vite** - Build tool

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Battle.tsx      # 🎯 Componente principal da batalha
│   ├── BattleCard.tsx  # Carta individual
│   ├── DeckBuilder.tsx # Construtor de baralho
│   ├── battle/         # Componentes da batalha
│   ├── effects/        # Efeitos visuais
│   ├── progression/    # Sistema de XP e conquistas
│   └── ui/            # Componentes UI (shadcn)
├── pages/             # Páginas
│   ├── Game.tsx       # Página do jogo
│   ├── Collection.tsx # Coleção de cartas
│   ├── Ranking.tsx    # Ranking de jogadores
│   └── Auth.tsx       # Autenticação
├── contexts/          # Contextos React
├── hooks/            # Custom hooks
└── integrations/     # Integrações (Supabase)
```

## 🎨 Sistema de Design

O projeto utiliza um design system baseado em **tokens semânticos**:

- **Cores**: Definidas em HSL no `src/index.css`
- **Componentes**: shadcn/ui customizados
- **Temas**: Suporte a dark/light mode
- **Animações**: Framer Motion + Tailwind Animate

### Paleta de Cores
- `--cosmic-gold`: Cor primária (dourado cósmico)
- `--space-dark`: Fundo escuro espacial
- `--cosmic-nebula`: Cor de destaque (nebulosa)

## 🗄️ Database Schema

### Principais Tabelas

#### `element_cards`
Cartas disponíveis no jogo
```sql
- id: uuid
- name: text (ex: "Hidrogênio")
- knight_name: text (ex: "Sir Hydrogen")
- symbol: text (ex: "H")
- atomic_number: integer
- atomic_mass: decimal
- density: decimal
- melting_point: decimal
- reactivity: integer
- radioactivity: integer
- rarity: text (common, rare, epic, legendary)
- is_super_trump: boolean
- image_url: text
```

#### `user_cards`
Cartas da coleção do usuário
```sql
- user_id: uuid (FK)
- card_id: uuid (FK -> element_cards)
- quantity: integer
```

#### `card_game_rankings`
Estatísticas e ranking dos jogadores
```sql
- user_id: uuid (FK)
- player_name: text
- total_score: integer
- games_won: integer
- games_lost: integer
- win_rate: decimal
- current_streak: integer
- last_played_at: timestamp
```

## 🔐 Autenticação

- **Provider**: Google OAuth (Supabase Auth)
- **Perfis**: Tabela `profiles` com informações adicionais
- **Roles**: `user` (padrão) ou `admin`

## 🧪 Desenvolvimento

### Pré-requisitos
```bash
Node.js 18+
npm ou bun
Conta Supabase
```

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# (já configurado via Supabase integration)

# Rodar em desenvolvimento
npm run dev
```

### Comandos Úteis
```bash
# Build para produção
npm run build

# Preview da build
npm run preview

# Linter
npm run lint
```

## 📖 Documentação Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica detalhada
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guia de desenvolvimento e padrões

## 🎯 Features

### Implementadas
- ✅ Sistema de batalha completo (Super Trunfo)
- ✅ Autenticação com Google
- ✅ Coleção de cartas
- ✅ Construtor de baralho
- ✅ Sistema de ranking
- ✅ Pack opening (1 pack a cada 7 dias)
- ✅ Sistema de XP e níveis
- ✅ Conquistas
- ✅ Tutorial interativo
- ✅ Efeitos visuais e animações

### Planejadas
- 🔄 Modo multijogador
- 🔄 Torneios
- 🔄 Chat entre jogadores
- 🔄 Mais tipos de cartas
- 🔄 Modo história

## 🐛 Troubleshooting

### Problemas Comuns

**"Você precisa de cartas para batalhar"**
- Verifique se o usuário tem cartas na tabela `user_cards`
- Execute a edge function `ensure-minimum-cards` se necessário

**"Falha ao carregar cartas"**
- Verifique RLS policies na tabela `user_cards`
- Confirme que o usuário está autenticado

**Batalha não funciona corretamente**
- Revise `ARCHITECTURE.md` seção "Regras do Jogo"
- Verifique console para erros
- Confirme que ambos baralhos têm cartas

## 📝 Licença

Este projeto é de código aberto para fins educacionais.

## 🤝 Contribuindo

1. Leia `DEVELOPMENT.md` para padrões de código
2. Crie uma branch descritiva
3. Faça commits atômicos
4. Teste suas mudanças
5. Abra um Pull Request

## 📞 Suporte

Para bugs e sugestões, abra uma issue no repositório.

---

## Lovable Project Info

**URL**: https://lovable.dev/projects/5803ff2a-8d1b-4519-a44c-a9249c4a6d30

**Desenvolvido com ❤️ usando Lovable e Supabase**
