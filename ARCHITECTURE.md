# Arquitetura do Projeto - Super Trunfo

## Visão Geral

Este projeto segue uma **arquitetura em camadas** (Layered Architecture) com separação clara de responsabilidades.

## Estrutura de Camadas

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │  ← React Components, Pages
├─────────────────────────────────────┤
│     Application Layer               │  ← Services, Use Cases
├─────────────────────────────────────┤
│     Domain Layer                    │  ← Business Logic, Interfaces
├─────────────────────────────────────┤
│     Infrastructure Layer            │  ← Repositories, External APIs
└─────────────────────────────────────┘
```

## Camadas

### 1. Domain Layer (`src/domain/`)

**Responsabilidade**: Lógica de negócio pura, independente de frameworks

```
domain/
├── entities/          # Entidades do domínio (futuro)
├── interfaces/        # Contratos de repositórios
│   ├── ICardRepository.ts
│   ├── IRankingRepository.ts
│   └── index.ts
├── value-objects/     # Objetos de valor (futuro)
└── services/         # Serviços de domínio (futuro)
```

**Características**:
- ✅ Sem dependências externas
- ✅ Funções puras
- ✅ Regras de negócio centralizadas
- ✅ Altamente testável

### 2. Application Layer (`src/application/`)

**Responsabilidade**: Casos de uso e orquestração

```
application/
├── services/
│   ├── BattleService.ts    # Orquestra lógica de batalha
│   └── index.ts
├── use-cases/              # Casos de uso específicos (futuro)
└── dto/                    # Data Transfer Objects (futuro)
```

**Características**:
- ✅ Coordena domínio e infraestrutura
- ✅ Valida entrada
- ✅ Transforma dados (DTOs)
- ✅ Implementa casos de uso

### 3. Infrastructure Layer (`src/infrastructure/`)

**Responsabilidade**: Implementações concretas e serviços externos

```
infrastructure/
├── repositories/
│   ├── SupabaseCardRepository.ts      # Implementação ICardRepository
│   ├── SupabaseRankingRepository.ts   # Implementação IRankingRepository
│   ├── RepositoryFactory.ts           # Factory de repositórios
│   └── index.ts
├── supabase/              # Configuração Supabase
└── external/              # Outros serviços externos (futuro)
```

**Características**:
- ✅ Implementa interfaces do domínio
- ✅ Isola detalhes técnicos
- ✅ Facilita substituição de implementações
- ✅ Gerencia persistência

### 4. Presentation Layer (`src/components/`, `src/pages/`)

**Responsabilidade**: Interface do usuário

```
components/
├── battle/              # Componentes de batalha
├── ui/                 # Componentes UI base
├── effects/            # Efeitos visuais
└── ...

pages/
├── Game.tsx            # Página principal do jogo
├── Collection.tsx      # Coleção de cartas
└── ...

hooks/
├── battle/             # Hooks de batalha
│   ├── useBattleOrchestrator.tsx  # Hook principal
│   ├── useBattleLogic.tsx         # Lógica de batalha
│   ├── useBattleState.tsx         # Estado da UI
│   └── useBattleEffects.tsx       # Efeitos visuais
└── ...
```

**Características**:
- ✅ React Components
- ✅ Custom Hooks
- ✅ Gerenciamento de estado local
- ✅ Interação com usuário

## Fluxo de Dados

### Exemplo: Iniciar Batalha

```
1. User Action (Presentation)
   ↓
   onClick handler in BattleArena.tsx

2. Hook (Presentation)
   ↓
   useBattleOrchestrator.startBattle()

3. Application Service
   ↓
   BattleService.validateDeckSize()
   BattleService.loadUserCards()

4. Infrastructure
   ↓
   SupabaseCardRepository.findByUserId()

5. Domain Interface
   ↓
   ICardRepository contract

6. Back to Presentation
   ↓
   Update UI with battle state
```

## Princípios Arquiteturais

### 1. Dependency Inversion Principle (DIP)

```typescript
// ❌ ERRADO: Dependência direta
import { supabase } from '@/integrations/supabase';

// ✅ CORRETO: Dependência de interface
import type { ICardRepository } from '@/domain/interfaces';
```

### 2. Single Responsibility Principle (SRP)

Cada camada tem UMA responsabilidade clara:
- **Domain**: Regras de negócio
- **Application**: Orquestração
- **Infrastructure**: Persistência
- **Presentation**: UI/UX

### 3. Open/Closed Principle (OCP)

Sistema aberto para extensão, fechado para modificação:

```typescript
// Fácil adicionar novo repositório sem modificar código existente
class MongoDBCardRepository implements ICardRepository {
  // Nova implementação
}
```

## Benefícios desta Arquitetura

### Para Desenvolvimento com IA

1. **Contexto Claro**: IA entende rapidamente onde adicionar código
2. **Documentação**: JSDoc e READMEs facilitam compreensão
3. **Padrões**: Estrutura consistente acelera geração de código
4. **Testabilidade**: Fácil criar testes para validar mudanças

### Para Manutenção

1. **Separação de Responsabilidades**: Fácil localizar bugs
2. **Substituibilidade**: Trocar implementações sem quebrar código
3. **Escalabilidade**: Adicionar features sem refatorar tudo
4. **Clareza**: Código auto-documentado

### Para Testes

1. **Isolamento**: Testar cada camada independentemente
2. **Mocks**: Fácil mockar repositórios e serviços
3. **Cobertura**: Testes unitários e de integração claros

## Exemplos de Uso

### Usando Repositórios

```typescript
import { RepositoryFactory } from '@/infrastructure/repositories';
import { supabase } from '@/integrations/supabase/client';

// Criar repositórios
const cardRepo = RepositoryFactory.createCardRepository(supabase);
const rankingRepo = RepositoryFactory.createRankingRepository(supabase);

// Usar nos hooks
const cards = await cardRepo.findByUserId(userId);
```

### Usando Serviços

```typescript
import { BattleService } from '@/application/services';

// Criar serviço
const battleService = new BattleService(cardRepo, rankingRepo);

// Validar e iniciar
battleService.validateDeckSize(selectedCards.length);
const opponentDeck = await battleService.createOpponentDeck(6);
```

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

## Database Schema

### Tabelas Principais

#### `element_cards`
```sql
- id: uuid (PK)
- name: text              # Nome do elemento
- knight_name: text       # Nome do cavaleiro
- rarity: text           # Raridade (common, rare, epic, legendary)
- atomic_number: integer # Número atômico
- atomic_mass: numeric   # Massa atômica
- density: numeric       # Densidade
- reactivity: integer    # Reatividade
- radioactivity: integer # Radioatividade
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
- player_name: text
- total_score: integer       # Pontuação total
- games_won: integer         # Partidas vencidas
- games_lost: integer        # Partidas perdidas
- win_rate: decimal          # Taxa de vitória (%)
- favorite_element_type: text # Elemento favorito
- last_played_at: timestamp
```

## Status de Implementação

### ✅ Fase 1 - Domain Layer (Completa)
- ✅ Interfaces de repositórios
- ✅ Tipos e contratos
- ✅ Documentação completa

### ✅ Fase 2 - Infrastructure Layer (Completa)
- ✅ RepositoryFactory
- ✅ SupabaseCardRepository
- ✅ SupabaseRankingRepository
- ✅ Testes com 100% de cobertura

### ✅ Fase 3 - Application Layer (Completa)
- ✅ BattleService
- ✅ Orquestração de casos de uso
- ✅ Integração com repositórios
- ✅ Testes com 95%+ de cobertura

### ✅ Fase 4 - Testing & Quality (Completa)
- ✅ Testes unitários para repositórios
- ✅ Testes para serviços de aplicação
- ✅ Testes para hooks de batalha
- ✅ Cobertura mínima de 80% configurada
- ✅ CI/CD com Husky (pre-commit e pre-push)

### ✅ Fase 5 - Documentation (Completa)
- ✅ Guia de contribuição (CONTRIBUTING.md)
- ✅ Documentação de API (docs/API.md)
- ✅ Exemplos de uso (docs/EXAMPLES.md)
- ✅ READMEs de cada camada
- ✅ Guia de desenvolvimento
- ✅ Guia de testes

## Próximos Passos

### Melhorias Futuras
- [ ] Testes E2E com Playwright
- [ ] Storybook para componentes
- [ ] Testes de acessibilidade
- [ ] Testes de performance (Lighthouse CI)

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
