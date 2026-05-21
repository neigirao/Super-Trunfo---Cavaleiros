<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Super Trunfo: Cavaleiros Elementais

Jogo de cartas no estilo **Super Trunfo** (Top Trumps) com tema de Cavaleiros Elementais baseados nos 118 elementos da Tabela Periódica. Desenvolvido em React 19, TypeScript e Vite, com Tailwind CSS.

## Funcionalidades

- 118 cartas representando todos os elementos da Tabela Periódica
- 5 atributos por carta: Reatividade, Massa Atômica, Radioatividade, Condutividade e Dureza
- Sistema de **Vantagem Elemental** com bônus de 20% em atributos específicos
- Carta **Super Trunfo** (Oganesson) que vence qualquer outra
- Login com **Google OAuth 2.0**
- **Painel de Administrador** para criar, editar e excluir cartas
- Ranking de jogadores (interface pronta, persistência em desenvolvimento)
- Animações de flip de carta e feedback visual de vitória/derrota
- Baralho persistido via `localStorage`

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| UI | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Estilo | Tailwind CSS (CDN) |
| Fontes | Cinzel + Roboto (Google Fonts) |
| Auth | Google Identity Services (GSI) |

## Estrutura do Projeto

```
/
├── index.html           # Ponto de entrada HTML
├── index.tsx            # Bootstrap React
├── App.tsx              # Componente raiz — lógica de jogo e estado global
├── types.ts             # Enums e interfaces TypeScript
├── constants.tsx        # Ícones SVG dos atributos
├── initialDeck.ts       # Baralho inicial (118 cartas)
├── vite.config.ts       # Configuração do Vite
├── package.json
├── tsconfig.json
└── components/
    ├── Card.tsx         # Componente de carta (frente/verso, animações)
    ├── AdminPanel.tsx   # CRUD de cartas para administrador
    └── Ranking.tsx      # Tabela de ranking de jogadores
```

## Regras do Jogo

1. O baralho é embaralhado e dividido igualmente entre o jogador e o computador.
2. Na sua vez, você escolhe um dos 5 atributos da sua carta do topo.
3. O atributo escolhido é comparado com a carta do topo do oponente. Quem tiver o maior valor vence a rodada e fica com as duas cartas.
4. Em caso de empate, cada carta volta para o fundo do seu respectivo baralho.
5. Quem colecionar todas as cartas vence o jogo.

### Super Trunfo
A carta **Titã de Oganesson** é o Super Trunfo: vence qualquer rodada independentemente do atributo escolhido, a menos que o oponente também jogue um Super Trunfo (empate).

## Sistema de Vantagem Elemental

Quando a carta do jogador tem vantagem sobre a do oponente, o valor do atributo correspondente recebe **+20% de bônus** antes da comparação.

| Atacante | Defensor | Atributo Bônus |
|---|---|---|
| Halogênio | Metal Alcalino | Reatividade |
| Metal Alcalino | Metal de Transição | Dureza |
| Metal de Transição | Actinídeo | Radioatividade |
| Actinídeo | Gás Nobre | Massa Atômica |
| Gás Nobre | Halogênio | Reatividade |

## Grupos de Elementos e Estilos Visuais

| Grupo | Cor da Borda | Gradiente |
|---|---|---|
| Metal Alcalino | Vermelho | `from-red-900` |
| Halogênio | Roxo | `from-purple-900` |
| Actinídeo | Verde-limão | `from-lime-900` |
| Metal de Transição | Ardósia | `from-slate-700` |
| Gás Nobre | Ciano | `from-cyan-800` |
| Metal Alcalinoterroso | Laranja | `from-orange-900` |
| Lantanídeo | Índigo | `from-indigo-900` |
| Metal Pós-Transição | Cinza | `from-gray-600` |
| Metaloide | Verde | `from-green-900` |
| Não Metal Reativo | Amarelo | `from-yellow-800` |

## Como Rodar Localmente

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Configuração

### Google Client ID (obrigatório para login)

Edite `App.tsx` e substitua o valor da constante:

```typescript
const GOOGLE_CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
```

Para obter um Client ID, acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie credenciais OAuth 2.0 para aplicação web.

### E-mail do Administrador

Para ter acesso ao Painel de Admin, configure o e-mail em `App.tsx`:

```typescript
const ADMIN_EMAIL = 'seu-email@gmail.com';
```

## Administração de Cartas

O Painel de Admin (acessível via login com o e-mail administrador) permite:

- Visualizar todas as cartas do baralho atual
- **Criar** novas cartas com nome, imagem, grupo químico e atributos
- **Editar** cartas existentes
- **Excluir** cartas do baralho
- Marcar uma carta como Super Trunfo

As alterações são persistidas automaticamente no `localStorage` do navegador.

## Limitações Conhecidas

- **Ranking sem backend**: a tela de ranking exibe a interface mas não persiste dados entre sessões.
- **IA passiva**: quando é a vez do computador (`isPlayerTurn = false`), o jogo aguarda a próxima rodada sem que a IA execute uma jogada automaticamente.
- **Imagens via Picsum**: as imagens das cartas são geradas pelo serviço externo `picsum.photos` com seed baseado no nome da carta.
