# Guia de Testes

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

## Estrutura de Testes

### 1. Testes Unitários
- **`src/lib/__tests__/utils.test.ts`**: Testa utilitários básicos
- **`src/hooks/battle/__tests__/useBattleLogic.test.tsx`**: Testa lógica de batalha
- **`src/components/__tests__/BattleCard.test.tsx`**: Testa componente de carta

### 2. Cobertura
Os testes cobrem:
- ✅ Lógica de batalha (início, cálculo de resultado, próxima rodada)
- ✅ Regras do Super Trunfo
- ✅ IA do oponente
- ✅ Renderização de componentes
- ✅ Utilitários e helpers

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

## Próximos Passos

Para expandir os testes:
1. Adicionar testes E2E com Playwright
2. Aumentar cobertura de componentes UI
3. Testar fluxos completos de usuário
4. Adicionar testes de acessibilidade
5. Implementar testes de performance
