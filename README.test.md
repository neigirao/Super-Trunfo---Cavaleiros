# Guia de Testes - Super Trunfo dos Elementos

## 🎯 Visão Geral

O projeto possui cobertura de testes abrangente com **80%+ de cobertura mínima** garantida por CI/CD.

### Testes Automáticos

Configurado com **Husky** e **lint-staged**:

- **Pre-commit**: Executa lint e testes nos arquivos modificados
- **Pre-push**: Executa todos os testes + verifica cobertura mínima

Isso garante que nenhuma modificação quebre o código existente.

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes com interface UI
npm run test:ui

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm test -- --watch
```

## 📁 Estrutura de Testes

### 1. Testes de Infraestrutura
- **Repositórios**:
  - `src/infrastructure/repositories/__tests__/SupabaseCardRepository.test.ts`
  - `src/infrastructure/repositories/__tests__/SupabaseRankingRepository.test.ts`
  - `src/infrastructure/repositories/__tests__/RepositoryFactory.test.ts`

### 2. Testes de Aplicação
- **Services**:
  - `src/application/services/__tests__/BattleService.test.ts`

### 3. Testes de Hooks
- **Battle Hooks**:
  - `src/hooks/battle/__tests__/useBattleLogic.test.tsx`
  - `src/hooks/battle/__tests__/useBattleOrchestrator.test.tsx`
  - `src/hooks/battle/__tests__/useBattleState.test.tsx`
  - `src/hooks/battle/__tests__/useBattleEffects.test.tsx`

### 4. Testes de Componentes
- `src/components/__tests__/BattleCard.test.tsx`

### 5. Testes de Utilidades
- `src/lib/__tests__/utils.test.ts`

### 6. Mocks
- `src/test/mocks/supabase.ts`: Mock do cliente Supabase
- `src/test/mocks/repositories.ts`: Mocks de repositórios

## 🎯 Cobertura de Testes

Os testes cobrem:

#### Camada de Infraestrutura (100%)
- ✅ CRUD de cartas via Supabase
- ✅ CRUD de ranking via Supabase
- ✅ Factory de repositórios
- ✅ Tratamento de erros de repositório

#### Camada de Aplicação (95%)
- ✅ Lógica de batalha (BattleService)
- ✅ Cálculo de resultados
- ✅ Salvamento de estatísticas
- ✅ Regras do Super Trunfo

#### Hooks de Batalha (90%)
- ✅ Orchestrator de batalha
- ✅ Lógica de batalha (início, rounds, game over)
- ✅ Estado da UI (fases, animações)
- ✅ Efeitos visuais (vitória, partículas)
- ✅ IA do oponente

#### Componentes (85%)
- ✅ Renderização de cartas
- ✅ Interações do usuário
- ✅ Estados de loading/erro

#### Utilitários (100%)
- ✅ Helpers e funções auxiliares

## 📊 Metas de Cobertura

| Categoria | Meta Mínima | Meta Ideal |
|-----------|-------------|------------|
| **Geral** | 80% | 90% |
| **Repositórios** | 100% | 100% |
| **Services** | 90% | 95% |
| **Hooks** | 85% | 90% |
| **Componentes** | 80% | 85% |
| **Utilitários** | 100% | 100% |

### 3. Boas Práticas
- Testes isolados e independentes
- Mocks para Supabase e dependências externas
- Testes de integração entre hooks e componentes
- Validação de estados e transições

## Adicionar Novos Testes

### Para um novo componente:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Para um novo hook:
```typescript
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from '../useYourHook';

describe('useYourHook', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

## Estrutura Escalável

O projeto está configurado para:
- ✅ Adicionar testes facilmente
- ✅ Rodar testes automaticamente em CI/CD
- ✅ Gerar relatórios de cobertura
- ✅ Identificar código não testado
- ✅ Manter qualidade do código via IA

## 🚀 Executar Testes com Cobertura

```bash
# Cobertura completa com relatório
npm run test:coverage

# Ver cobertura no navegador
npm run test:coverage -- --reporter=html
open coverage/index.html
```

## 🎭 Mocks e Fixtures

### Supabase Mock
```typescript
import { mockSupabase } from '@/test/mocks/supabase';

// Mock já configurado com métodos básicos
mockSupabase.from().select().eq().mockResolvedValue({
  data: mockData,
  error: null
});
```

### Repositórios Mock
```typescript
import { createMockCardRepository } from '@/test/mocks/repositories';

const mockRepo = createMockCardRepository();
mockRepo.findByUserId.mockResolvedValue([mockCard1, mockCard2]);
```

### Dados de Teste
```typescript
import { mockCardData } from '@/test/mocks/repositories';

// Cartas pré-configuradas para testes
const [hydrogen, carbon, uranium] = mockCardData;
```

## ✅ Checklist: Antes de Commitar

- [ ] Todos os testes passando: `npm test`
- [ ] Cobertura mínima atingida: `npm run test:coverage`
- [ ] Lint sem erros: `npm run lint`
- [ ] Build funcionando: `npm run build`
- [ ] Testes de novos recursos adicionados

## 🐛 Debugging de Testes

### 1. Teste específico
```bash
npm test -- useBattleLogic
```

### 2. UI interativa
```bash
npm run test:ui
```

### 3. Watch mode com filtro
```bash
npm test -- --watch --grep="BattleService"
```

### 4. Debug no VS Code
Adicione breakpoints e use a configuração de debug:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Vitest Debug",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run", "--inspect-brk"]
}
```

## 📈 Próximos Passos

### Fase 5 - Melhorias Futuras
1. ✅ Testes E2E com Playwright
2. ✅ Aumentar cobertura de componentes UI para 90%
3. ✅ Testes de acessibilidade automatizados
4. ✅ Testes de performance (Lighthouse CI)
5. ✅ Snapshot testing para componentes críticos

### Integrações Futuras
- [ ] CI/CD com GitHub Actions
- [ ] Relatórios de cobertura em PRs
- [ ] Testes visuais com Percy/Chromatic
- [ ] Testes de carga com k6

---

**Importante**: Os testes são executados automaticamente antes de cada commit e push. Certifique-se de que todos passam antes de criar um Pull Request.
