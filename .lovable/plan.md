## Diagnóstico: por que o botão de login não faz nada

Rastreei o fluxo do botão "ENTRAR / CRIAR CONTA / JOGAR" em `components/HomeMenu.tsx`:

```
botão onClick → triggerGoogleSignIn() → window.google.accounts.id.prompt()
```

O `prompt()` só funciona se o GSI tiver sido inicializado em `App.tsx` (linhas 208-230), e essa inicialização tem uma guarda:

```ts
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
const isClientIdConfigured = !!GOOGLE_CLIENT_ID;
useEffect(() => {
  if (!isClientIdConfigured) return;   // ← sai cedo
  ...
});
```

O arquivo `.env` atual contém apenas as chaves do Supabase — **`VITE_GOOGLE_CLIENT_ID` não existe**. Resultado:

- `GOOGLE_CLIENT_ID = ''`
- `isClientIdConfigured = false`
- `google.accounts.id.initialize()` nunca roda
- `google.accounts.id.prompt()` é um no-op silencioso
- **Clique no botão = nada acontece** (sem erro no console, por isso passa despercebido)

Além disso, mesmo configurando um Client ID, o fluxo `prompt()` do GSI vem sendo bloqueado por navegadores (FedCM, third-party cookies) — é um caminho frágil.

## Solução recomendada: migrar para Supabase Google OAuth

A memória do projeto já define **"Authentication uses Supabase Google OAuth"**, e o cliente Supabase já está instalado e configurado. Vou trocar o GSI manual por `supabase.auth.signInWithOAuth({ provider: 'google' })`, que é mais robusto e elimina a dependência de Client ID no front-end.

### Mudanças

1. **`App.tsx`**
   - Remover bloco GSI (linhas 187-230) e a constante `GOOGLE_CLIENT_ID`.
   - Substituir por listener `supabase.auth.onAuthStateChange` + `getSession()` para hidratar `userProfile` a partir de `session.user` (nome/email/avatar vêm de `user_metadata`).
   - Manter `isAdmin` derivado de `userProfile.email === ADMIN_EMAIL`.
   - Adicionar `handleSignOut` chamando `supabase.auth.signOut()`.
   - Remover prop `isClientIdConfigured` passada para `HomeMenu`/`Dashboard`.

2. **`components/HomeMenu.tsx`**
   - Substituir `triggerGoogleSignIn` por chamada a `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
   - Remover o `<div id="google-signin-button" />` (não é mais necessário).
   - Remover prop `isClientIdConfigured` da interface.

3. **`index.html`**
   - Remover `<script src="https://accounts.google.com/gsi/client" ...>` (não mais usado).

4. **Configuração Supabase (instrução para o usuário, não código)**
   - Habilitar o provider Google em Supabase → Auth → Providers, colando o Client ID e Secret do Google Cloud Console.
   - Adicionar a URL do preview/produção em "Redirect URLs".

## Auditoria — outros problemas encontrados

Em ordem de prioridade:

1. **`index.html` usa `importmap` para React via CDN (`esm.sh/react@19`)** enquanto o projeto também tem React instalado via `package.json` (Vite). Isso pode causar duas cópias de React em runtime (quebra de hooks, contexto). Recomendado: remover o `<script type="importmap">` e deixar o Vite resolver.

2. **`index.html` carrega Tailwind via CDN (`cdn.tailwindcss.com`)**, que é destinado apenas a desenvolvimento e emite warning em produção. Recomendado: instalar `tailwindcss` + `postcss` + `autoprefixer` localmente.

3. **`ADMIN_EMAIL` ainda é hard-coded** (`'neigirao@gmail.com'` como fallback). Após a migração para Supabase Auth, a forma correta é usar uma tabela `user_roles` com role `admin` (conforme regra de segurança do projeto) — mas é uma etapa separada que posso fazer em seguida.

4. **`vite.config.ts` expõe `process.env.GEMINI_API_KEY` no bundle**, mas a chave não é usada em lugar nenhum do código. Risco baixo, mas vale remover.

5. **`Ranking`/`saveRanking` insere sem `user_id`**, então a agregação em `loadRanking` cai no fallback por `player_name`. Após o login Supabase, posso preencher `user_id: session.user.id` (melhora unicidade do ranking).

## O que NÃO faço neste plano

- Não vou criar a tabela `user_roles` agora (item 3 acima) — é uma mudança maior que merece sua aprovação separada.
- Não vou resolver Tailwind/importmap agora (itens 1 e 2) — também são refatorações independentes; sinalize se quiser que eu inclua.

## Resultado esperado

Após implementar: clicar em "ENTRAR" / "CRIAR CONTA" / "JOGAR" redireciona para a tela de consentimento do Google; ao voltar, o usuário está logado e o botão "JOGAR" inicia a partida normalmente.