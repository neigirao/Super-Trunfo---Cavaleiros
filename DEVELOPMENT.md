# 🚀 Guia de Desenvolvimento

## Arquitetura

Ver `ARCHITECTURE.md` para detalhes da arquitetura em camadas.

## Estrutura

```
src/
├── domain/          # Interfaces e regras de negócio
├── application/     # Services e lógica de aplicação
├── infrastructure/  # Implementações (Supabase)
├── hooks/           # React hooks (modulares)
├── components/      # UI components
└── test/           # Mocks e configuração de testes
```

## Desenvolvimento

```bash
npm run dev          # Servidor de desenvolvimento
npm test            # Executar testes
npm run test:coverage # Cobertura de testes (80%+ mínimo)
npm run build       # Build de produção
```

## Padrões

- **TypeScript**: Sempre use tipos explícitos
- **Testes**: 80%+ cobertura obrigatória
- **Commits**: Mensagens semânticas (feat:, fix:, test:)
- **Hooks**: Use useCallback/useMemo
- **Componentes**: Pequenos e focados

## Testes

Ver `README.test.md` para guia completo de testes.

## CI/CD

- **Pre-commit**: Lint + testes modificados
- **Pre-push**: Todos testes + cobertura
