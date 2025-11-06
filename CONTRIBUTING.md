# 🤝 Guia de Contribuição

Obrigado por contribuir com o **Super Trunfo dos Elementos**! Este guia ajudará você a entender como contribuir de forma eficiente.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Padrões de Código](#padrões-de-código)
5. [Testes](#testes)
6. [Commits](#commits)
7. [Pull Requests](#pull-requests)

## Código de Conduta

Este projeto segue o [Código de Conduta da Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/super-trunfo.git
cd super-trunfo

# Instale dependências
npm install
```

### 2. Crie uma Branch

```bash
# Sempre crie a partir da main
git checkout main
git pull origin main

# Crie uma branch descritiva
git checkout -b feat/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

### 3. Desenvolva

Siga a [arquitetura em camadas](./ARCHITECTURE.md) do projeto:

```
src/
├── domain/          # Lógica de negócio pura
├── application/     # Casos de uso e orquestração
├── infrastructure/  # Implementações (Supabase, etc)
├── hooks/           # React hooks modulares
├── components/      # Componentes React
└── test/           # Mocks e configuração de testes
```

### 4. Teste

```bash
# Execute todos os testes
npm test

# Execute com cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

### 5. Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>(<scope>): <description>

# Exemplos
feat(battle): adiciona sistema de combo
fix(cards): corrige cálculo de raridade
test(hooks): adiciona testes para useBattleLogic
docs(readme): atualiza guia de instalação
refactor(services): simplifica BattleService
```

### 6. Push e PR

```bash
# Push para seu fork
git push origin feat/nova-funcionalidade

# Abra um Pull Request no GitHub
```

## Estrutura do Projeto

### Arquitetura em Camadas

Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a arquitetura completa.

#### Domain Layer

**Responsabilidade**: Lógica de negócio pura

```typescript
// src/domain/interfaces/ICardRepository.ts
export interface ICardRepository {
  findByUserId(userId: string): Promise<Card[]>;
  findById(cardId: string): Promise<Card | null>;
}
```

#### Application Layer

**Responsabilidade**: Casos de uso e orquestração

```typescript
// src/application/services/BattleService.ts
export class BattleService {
  constructor(
    private cardRepo: ICardRepository,
    private rankingRepo: IRankingRepository
  ) {}

  async startBattle(userId: string) {
    // Orquestra lógica de batalha
  }
}
```

#### Infrastructure Layer

**Responsabilidade**: Implementações concretas

```typescript
// src/infrastructure/repositories/SupabaseCardRepository.ts
export class SupabaseCardRepository implements ICardRepository {
  async findByUserId(userId: string): Promise<Card[]> {
    // Implementação com Supabase
  }
}
```

#### Presentation Layer

**Responsabilidade**: UI e interação

```typescript
// src/hooks/battle/useBattleOrchestrator.tsx
export const useBattleOrchestrator = () => {
  // Hook que usa os serviços
  const battleService = new BattleService(cardRepo, rankingRepo);
  // ...
};
```

## Padrões de Código

### TypeScript

✅ **Sempre use tipos explícitos**

```typescript
// ❌ ERRADO
const calculatePower = (card: any) => {
  return card.atomicNumber * 2;
};

// ✅ CORRETO
const calculatePower = (card: ElementCard): number => {
  return card.atomic_number * 2;
};
```

✅ **Use interfaces do domínio**

```typescript
// ❌ ERRADO: Dependência direta
import { supabase } from '@/integrations/supabase';

// ✅ CORRETO: Dependência de interface
import type { ICardRepository } from '@/domain/interfaces';
```

### React Hooks

✅ **Use useCallback e useMemo**

```typescript
// ✅ CORRETO
const handleBattle = useCallback(
  (attribute: BattleAttribute) => {
    // lógica
  },
  [dependencies]
);

const filteredCards = useMemo(
  () => cards.filter((card) => card.rarity === selectedRarity),
  [cards, selectedRarity]
);
```

### Componentes

✅ **Componentes pequenos e focados**

```typescript
// ✅ CORRETO: Componente focado
export const BattleCard = ({ card, onSelect }: BattleCardProps) => {
  return (
    <Card onClick={() => onSelect(card)}>
      <CardHeader>{card.name}</CardHeader>
      {/* ... */}
    </Card>
  );
};
```

### Estilização

✅ **Use tokens do design system**

```typescript
// ❌ ERRADO: Classes diretas
<div className="text-white bg-black">

// ✅ CORRETO: Tokens semânticos
<div className="text-foreground bg-background">
```

## Testes

### Cobertura Mínima

O projeto exige **80%+ de cobertura** em:

- ✅ Statements
- ✅ Branches
- ✅ Functions
- ✅ Lines

### Estrutura de Testes

```
src/
├── infrastructure/
│   └── repositories/
│       └── __tests__/
│           └── SupabaseCardRepository.test.ts
├── application/
│   └── services/
│       └── __tests__/
│           └── BattleService.test.ts
└── hooks/
    └── battle/
        └── __tests__/
            └── useBattleLogic.test.tsx
```

### Exemplo de Teste

```typescript
import { describe, it, expect, vi } from 'vitest';
import { BattleService } from '../BattleService';

describe('BattleService', () => {
  it('should validate deck size correctly', () => {
    const service = new BattleService(mockCardRepo, mockRankingRepo);

    expect(() => service.validateDeckSize(5)).toThrow('Minimum 6 cards');
    expect(() => service.validateDeckSize(6)).not.toThrow();
  });
});
```

### Mocks

Use mocks centralizados:

```typescript
import { createMockCardRepository } from '@/test/mocks/repositories';

const mockRepo = createMockCardRepository();
mockRepo.findByUserId.mockResolvedValue([mockCard1, mockCard2]);
```

## Commits

### Conventional Commits

Use o formato padrão:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos Aceitos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Adiciona/corrige testes
- `chore`: Manutenção (build, CI, etc)
- `perf`: Melhoria de performance

### Exemplos

```bash
feat(battle): adiciona sistema de combo entre cartas
fix(ranking): corrige cálculo de win rate
test(services): adiciona testes para BattleService
docs(architecture): atualiza diagrama de camadas
refactor(hooks): simplifica useBattleOrchestrator
```

## Pull Requests

### Checklist

Antes de abrir um PR, certifique-se:

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes estão passando: `npm test`
- [ ] Cobertura mínima mantida: `npm run test:coverage`
- [ ] Lint sem erros: `npm run lint`
- [ ] Build funciona: `npm run build`
- [ ] Commits seguem Conventional Commits
- [ ] Branch está atualizada com `main`

### Template de PR

```markdown
## Descrição

[Descreva as mudanças]

## Tipo de Mudança

- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Refatoração (refactor)
- [ ] Documentação (docs)
- [ ] Testes (test)

## Como Testar

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

## Screenshots (se aplicável)

[Adicione screenshots]

## Checklist

- [ ] Código segue os padrões
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Cobertura de testes mantida
```

## Processo de Review

### O que esperamos

1. **Código limpo**: Fácil de ler e entender
2. **Testes**: Cobertura adequada
3. **Documentação**: JSDoc e READMEs atualizados
4. **Arquitetura**: Segue as camadas definidas
5. **Performance**: Não introduz regressões

### O que fazemos

1. Review de código em até 48h
2. Feedback construtivo
3. Sugestões de melhorias
4. Merge após aprovação

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Testes
npm test                 # Executa testes
npm run test:ui          # Interface visual de testes
npm run test:coverage    # Cobertura de testes

# Qualidade
npm run lint             # Verifica lint
npm run build            # Build de produção

# Git
git status               # Status atual
git log --oneline        # Histórico resumido
git diff                 # Ver mudanças
```

## Ajuda

### Dúvidas?

- 📖 Leia a [documentação](./README.md)
- 🏗️ Consulte a [arquitetura](./ARCHITECTURE.md)
- 🧪 Veja o [guia de testes](./README.test.md)
- 💬 Abra uma [Issue](https://github.com/seu-usuario/super-trunfo/issues)

### Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Obrigado por contribuir! 🎉**
