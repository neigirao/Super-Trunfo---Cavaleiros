# Guia de Desenvolvimento

## Setup do Projeto

### Pré-requisitos
- Node.js 18+
- Conta Supabase
- Editor de código (VS Code recomendado)

### Instalação
```bash
npm install
npm run dev
```

## Estrutura de Branches
- `main`: Produção
- `development`: Desenvolvimento
- `feature/*`: Novas features

## Fluxo de Desenvolvimento

### 1. Antes de Começar
- Leia `ARCHITECTURE.md` para entender a estrutura
- Verifique issues existentes
- Crie uma branch descritiva

### 2. Durante o Desenvolvimento
- Mantenha commits atômicos e descritivos
- Siga as convenções de código
- Teste localmente antes de commitar

### 3. Testes
- Teste todas as funcionalidades afetadas
- Verifique responsividade (mobile/desktop)
- Teste autenticação se relevante

## Padrões de Código

### Nomenclatura
```typescript
// Componentes: PascalCase
const BattleCard = () => {}

// Funções: camelCase
const handleCardClick = () => {}

// Constantes: UPPER_SNAKE_CASE
const MAX_CARDS_PER_PLAYER = 30

// Interfaces: PascalCase com prefixo I opcional
interface BattleState {}
```

### Estrutura de Componentes
```typescript
/**
 * Descrição do componente
 * @param props - Descrição das props
 */
interface ComponentProps {
  // Props aqui
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Efeitos
  useEffect(() => {}, [])
  
  // 3. Handlers
  const handleAction = () => {}
  
  // 4. Render
  return <div>...</div>
}
```

### Supabase Queries
```typescript
// Sempre use tipagem
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)

// Sempre trate erros
if (error) {
  console.error('Error:', error)
  toast.error('Mensagem amigável')
  return
}
```

## Migrations do Banco de Dados

### Criar Nova Migration
1. Use a ferramenta de migration do Lovable
2. SQL deve ser idempotente quando possível
3. Sempre inclua RLS policies para novas tabelas

### Exemplo de Migration
```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS public.nova_tabela (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data"
  ON public.nova_tabela
  FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger de updated_at
CREATE TRIGGER update_nova_tabela_updated_at
  BEFORE UPDATE ON public.nova_tabela
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Design System

### Cores
**NUNCA** use cores diretamente. Use tokens:
```tsx
// ❌ ERRADO
<div className="bg-blue-500 text-white">

// ✅ CORRETO
<div className="bg-primary text-primary-foreground">
```

### Tokens Disponíveis
```css
/* Backgrounds */
--background
--foreground

/* Cards */
--card
--card-foreground

/* Primary Actions */
--primary
--primary-foreground

/* Secondary Actions */
--secondary
--secondary-foreground

/* Destructive Actions */
--destructive
--destructive-foreground

/* Borders */
--border
--input
--ring
```

### Componentes UI
Todos em `src/components/ui/` são do shadcn:
- Não modifique a estrutura base
- Customize via variants quando necessário
- Adicione variants no próprio arquivo do componente

## Estado e Dados

### Context API
Use para estado global:
- Autenticação (`AuthContext`)
- Temas
- Configurações

### Local State
Use `useState` para:
- Estado de formulários
- UI ephemeral (modals, tooltips)
- Estados de componente isolado

### Server State
Use Supabase + React Query para:
- Dados do banco
- Cache de requisições
- Sincronização de dados

## Debugging

### Console Logs
- Remova console.logs antes de produção
- Use para debugging durante desenvolvimento
- Estruture logs de forma clara:
```typescript
console.log('Battle - Card Selected:', { card, attribute })
```

### Supabase Logs
- Edge Functions: Disponíveis no dashboard
- Database: Use o SQL editor para queries
- Storage: Verifique policies se upload falhar

### Common Issues

#### "User not authenticated"
- Verifique RLS policies
- Confirme que `auth.uid()` está disponível
- Teste com usuário autenticado

#### "Cards not loading"
- Verifique `user_cards` table
- Confirme que usuário tem cartas
- Execute edge function `ensure-minimum-cards`

#### "Battle not working"
- Revise `ARCHITECTURE.md` - seção Regras do Jogo
- Verifique estado do baralho
- Confirme lógica de vitória/derrota

## Performance

### Otimizações
```typescript
// Use memo para componentes pesados
const HeavyComponent = memo(({ data }) => {})

// Use callback para funções em props
const handleClick = useCallback(() => {}, [deps])

// Use useMemo para cálculos pesados
const expensiveValue = useMemo(() => calculate(), [deps])
```

### Lazy Loading
```typescript
const LazyComponent = lazy(() => import('./Component'))

// Uso
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

## Segurança

### RLS Policies
- **SEMPRE** habilite RLS em novas tabelas
- Teste policies com diferentes usuários
- Nunca confie apenas em lógica frontend

### Validação
- Valide no frontend (UX)
- Valide no backend (segurança)
- Use Zod para schemas de validação

### Autenticação
- Nunca armazene tokens no localStorage diretamente
- Use Supabase client (já configurado)
- Sempre verifique `user` antes de ações sensíveis

## Deploy

### Lovable Deploy
1. Commit suas mudanças
2. Push para branch
3. Lovable detecta e deploya automaticamente

### Supabase
- Migrations são aplicadas automaticamente
- Edge functions são deployadas no push
- Verifique logs após deploy

## Troubleshooting

### Build Errors
1. Limpe cache: `rm -rf node_modules && npm install`
2. Verifique imports
3. Verifique TypeScript errors

### Runtime Errors
1. Verifique console logs
2. Verifique network requests
3. Verifique Supabase dashboard

### Database Issues
1. Verifique migrations
2. Revise RLS policies
3. Teste queries no SQL editor

## Recursos

### Documentação
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion)
- [shadcn/ui](https://ui.shadcn.com)

### Lovable
- [Docs](https://docs.lovable.dev)
- [Discord](https://discord.com/channels/1119885301872070706)
- [YouTube](https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO)
