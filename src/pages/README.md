# Pages - Páginas da Aplicação

Esta pasta contém todos os componentes de página (rotas) da aplicação.

## 📁 Estrutura

```
src/pages/
├── Index.tsx        # Página inicial (landing page)
├── Auth.tsx         # Autenticação (login/signup)
├── Game.tsx         # Página principal do jogo
├── Collection.tsx   # Coleção de cartas do usuário
├── Ranking.tsx      # Ranking global de jogadores
├── Settings.tsx     # Configurações do usuário
├── Admin.tsx        # Painel administrativo
└── NotFound.tsx     # Página 404
```

## 🗺️ Rotas

As rotas são definidas em `src/App.tsx`:

```typescript
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/game" element={<Game />} />
  <Route path="/collection" element={<Collection />} />
  <Route path="/ranking" element={<Ranking />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## 📄 Páginas

### `Index.tsx` - Landing Page
**Rota**: `/`

**Descrição**: Página inicial pública do jogo

**Elementos**:
- Hero section com animações
- Features do jogo
- Call-to-action para jogar
- Estatísticas ao vivo

**Autenticação**: Não requerida

**Navegação**: Redireciona para `/game` se usuário estiver logado

---

### `Auth.tsx` - Autenticação
**Rota**: `/auth`

**Descrição**: Página de login/registro

**Elementos**:
- Login com Google OAuth
- Background animado temático
- Redirecionamento após login

**Autenticação**: Não requerida (página pública)

**Navegação**: Redireciona para `/game` após login bem-sucedido

---

### `Game.tsx` - Jogo Principal
**Rota**: `/game`

**Descrição**: Página principal onde o jogo acontece

**Elementos**:
- Componente `<Battle />`: Sistema de batalha
- Componente `<PackOpening />`: Abertura de pacotes
- Navbar
- Seletor de modo (Batalha / Coleção)
- Score e streak display

**Autenticação**: Requerida (redireciona para `/auth` se não logado)

**Estado**:
- `gameMode`: 'battle' | 'collection'
- `isBattleActive`: boolean
- `score`, `streak`: number

---

### `Collection.tsx` - Coleção de Cartas
**Rota**: `/collection`

**Descrição**: Visualização da coleção completa do usuário

**Elementos**:
- Grid de cartas do usuário
- Filtros por raridade, tipo, etc
- Estatísticas da coleção
- Indicador de cartas faltantes

**Autenticação**: Requerida

**Features**:
- Busca de cartas
- Ordenação (raridade, número atômico, etc)
- Visualização detalhada de carta

---

### `Ranking.tsx` - Ranking Global
**Rota**: `/ranking`

**Descrição**: Ranking de jogadores

**Elementos**:
- Tabela de rankings
- Filtros (tempo, modo de jogo)
- Estatísticas do jogador atual
- Top 10 / Top 100

**Autenticação**: Não requerida (público)

**Features**:
- Componente `<EnhancedRanking />`
- Paginação
- Atualização em tempo real

---

### `Settings.tsx` - Configurações
**Rota**: `/settings`

**Descrição**: Configurações do usuário

**Elementos**:
- Perfil do usuário
- Customização (avatar, tema)
- Preferências de notificação
- Gerenciamento de conta

**Autenticação**: Requerida

**Features**:
- Componente `<UserCustomization />`
- Upload de avatar
- Configuração de tema (light/dark/system)

---

### `Admin.tsx` - Painel Admin
**Rota**: `/admin`

**Descrição**: Painel administrativo

**Elementos**:
- Gerenciamento de cartas
- Upload de imagens
- Estatísticas do sistema
- Gerenciamento de usuários

**Autenticação**: Requerida + Admin role

**Proteção**:
```typescript
if (!isAdmin) {
  return <Navigate to="/" replace />;
}
```

---

### `NotFound.tsx` - Página 404
**Rota**: `*` (qualquer rota não definida)

**Descrição**: Página de erro 404

**Elementos**:
- Mensagem de erro amigável
- Botão para voltar à home
- Animação temática

**Autenticação**: Não requerida

## 🏗️ Anatomia de uma Página

### Estrutura Padrão
```typescript
/**
 * @fileoverview Descrição da página
 * 
 * Rota: /route
 * Autenticação: Sim/Não
 * Role: user/admin/public
 */
import { ... } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const PageName = () => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Auth check
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto">
        {/* Conteúdo da página */}
      </main>
    </div>
  );
};

export default PageName;
```

## 🎨 Padrões de Layout

### Layout Consistente
Todas as páginas autenticadas devem incluir:
```typescript
<div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark">
  <Navbar />
  <main className="container mx-auto pt-20 pb-8 px-4">
    {/* Conteúdo */}
  </main>
</div>
```

### Background Animado
Para páginas com tema cósmico:
```typescript
{/* Animated background elements */}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-gold opacity-10 rounded-full animate-stellar-pulse" />
  {/* mais elementos */}
</div>
```

## 🔐 Proteção de Rotas

### Rota Pública
```typescript
// Sem verificação de auth
const PublicPage = () => {
  return <div>Conteúdo público</div>;
};
```

### Rota Protegida (User)
```typescript
const ProtectedPage = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return <div>Conteúdo protegido</div>;
};
```

### Rota Protegida (Admin)
```typescript
const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <div>Conteúdo admin</div>;
};
```

## 📝 Convenções

### Nomenclatura
- **PascalCase**: Todos os componentes de página
- **Descritivo**: Nome deve indicar claramente a função
- **Singular**: `Game.tsx`, não `Games.tsx`

### SEO
```typescript
import { Helmet } from 'react-helmet-async'; // Se instalado

<Helmet>
  <title>Página - Super Trunfo Elementos</title>
  <meta name="description" content="Descrição da página" />
</Helmet>
```

### Loading States
Sempre forneça feedback durante carregamento:
```typescript
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-cosmic-gold border-t-transparent" />
    </div>
  );
}
```

## 🚀 Melhores Práticas

1. **Lazy Loading**
   ```typescript
   const Admin = lazy(() => import('@/pages/Admin'));
   ```

2. **Error Boundaries**
   ```typescript
   <ErrorBoundary>
     <Page />
   </ErrorBoundary>
   ```

3. **Prefetch de Dados**
   ```typescript
   useEffect(() => {
     prefetchData();
   }, []);
   ```

4. **Otimização de Imagens**
   ```typescript
   <img loading="lazy" decoding="async" />
   ```

5. **Scroll to Top**
   ```typescript
   useEffect(() => {
     window.scrollTo(0, 0);
   }, []);
   ```

## 🤖 Para a IA

Ao criar/modificar páginas:
1. **Verifique rotas existentes** antes de criar novas
2. **Use componentes compartilhados** (Navbar, Footer, etc)
3. **Implemente proteção de rotas** corretamente
4. **Adicione loading states**
5. **Siga o padrão de layout** estabelecido
6. **Use design system** (cores, espaçamentos)
7. **Documente a rota** no topo do arquivo
8. **Considere SEO** (títulos, meta tags)
9. **Otimize performance** (lazy loading, memoization)
10. **Trate erros** adequadamente
