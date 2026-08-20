# Sessão 02 — Autenticação, Layout e CRUD de Matérias-Primas

**Data:** 19/08/2026
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Criação dos clientes do Supabase (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
2. Criação do arquivo de proxy (`proxy.ts`) para proteção de rotas
3. Configuração do Supabase Auth — provider de e-mail habilitado, confirmação desativada
4. Criação do usuário no painel do Supabase
5. Organização das rotas com Route Groups (`(auth)` e `(protected)`)
6. Criação da página de login (`app/(auth)/login/page.tsx`)
7. Criação do layout mobile-first com navegação inferior (`app/(protected)/layout.tsx`)
8. Redirecionamento da raiz `/` para `/dashboard`
9. Correção do caminho do cliente Prisma (`lib/prisma.ts`)
10. CRUD completo de Matérias-Primas (listar, criar, deletar)

---

## 🧠 Conceitos aprendidos

### Supabase Auth
- **Provider** — método de autenticação (e-mail, Google, GitHub, etc.)
- **Confirm email** — exige que o usuário clique em um link antes de logar; desativamos pois o usuário é criado manualmente
- **`signInWithPassword()`** — função do Supabase que autentica com e-mail e senha
- **Sessão** — estado de autenticação mantido via cookies; o Supabase gerencia automaticamente
- **Single-user system** — sistema com um único usuário; não faz sentido ter tela de cadastro pública

### Clientes do Supabase (três contextos)
- **`createBrowserClient`** — para componentes com `"use client"`; roda no navegador
- **`createServerClient`** — para Server Components e Server Actions; precisa ler/gravar cookies
- **`@supabase/ssr`** — pacote que fornece os dois tipos acima, projetado para Next.js App Router

### Next.js App Router — Roteamento
- **Route Groups** — pastas com `()` no nome que organizam rotas sem afetar a URL
  - `(auth)` → rotas públicas (login)
  - `(protected)` → rotas que exigem autenticação
- **`redirect()`** — função do Next.js para redirecionar no servidor
- **`proxy.ts`** — arquivo especial do Next.js 16 que intercepta todas as requisições (era `middleware.ts` em versões anteriores)
- **`matcher`** — configuração que define em quais rotas o proxy roda; usa regex para excluir arquivos estáticos

### Proteção de rotas
- O `proxy.ts` roda antes de qualquer página ser renderizada
- Ele verifica se o usuário está autenticado via `supabase.auth.getUser()`
- Se não estiver autenticado e tentar acessar qualquer rota que não seja `/login`, redireciona para `/login`
- Isso protege todas as rotas de uma vez só, sem precisar verificar em cada página

### React — Hooks e estado
- **`useState`** — hook que cria uma variável reativa; quando ela muda, o componente re-renderiza
  - `const [email, setEmail] = useState('')` → `email` é o valor, `setEmail` é a função para atualizá-lo
- **`useRouter`** — hook do Next.js que permite navegar entre páginas programaticamente
  - `router.push('/dashboard')` → navega para `/dashboard`
- **`"use client"`** — diretiva que marca um componente para rodar no navegador (necessário para usar hooks)

### Server Actions
- **`"use server"`** — diretiva que marca uma função para rodar exclusivamente no servidor
- Permitem chamar funções de banco de dados diretamente de componentes, sem criar uma API REST separada
- **`revalidatePath()`** — após uma mutation (criar/deletar), invalida o cache da rota para que a lista seja recarregada
- **`FormData`** — objeto nativo do navegador que representa os dados de um formulário; `.get('campo')` retorna o valor

### Prisma — Operações
- **`findMany()`** — busca múltiplos registros; `orderBy` define a ordenação
- **`create()`** — cria um novo registro; `data` contém os campos
- **`delete()`** — deleta um registro; `where` define qual
- **`bind(null, m.id)`** — técnica JavaScript para passar argumentos fixos para uma Server Action usada como `action` de formulário

### TypeScript — Tipagem
- **`import type`** — importa apenas o tipo, sem código executável; boa prática para tipos
- **`as`** — alias de importação: `import { MateriaPrimaModel as MateriaPrima }` permite usar o nome `MateriaPrima` no código
- **Caminhos relativos** — `../../` sobe dois níveis de pasta; contar os níveis corretamente é essencial

### Tailwind CSS
- **`fixed bottom-0 left-0 right-0`** — fixa um elemento na parte inferior da tela, ocupando toda a largura
- **`flex-1`** — divide o espaço disponível igualmente entre os filhos
- **`pb-20`** — padding-bottom para evitar que o conteúdo fique escondido atrás da navegação fixa
- **`transition-colors`** — anima a mudança de cor suavemente
- **`space-y-{n}`** — adiciona espaçamento vertical entre elementos filhos

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          ← página de login
│   ├── (protected)/
│   │   ├── layout.tsx            ← layout com navegação inferior
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← página inicial protegida
│   │   └── materias-primas/
│   │       ├── page.tsx          ← listagem + formulário
│   │       └── actions.ts        ← Server Actions (listar, criar, deletar)
│   └── page.tsx                  ← redireciona para /dashboard
├── lib/
│   ├── prisma.ts                 ← corrigido caminho do cliente Prisma
│   └── supabase/
│       ├── client.ts             ← cliente para o navegador
│       ├── server.ts             ← cliente para o servidor
│       └── middleware.ts         ← helper para o proxy
└── proxy.ts                      ← proteção de rotas (era middleware.ts)
```

---

## 🗃️ CRUD de Matérias-Primas

### Operações implementadas:
- **Listar** — `findMany()` ordenado por nome
- **Criar** — `create()` com nome, unidade e preço unitário
- **Deletar** — `delete()` por ID com botão de lixeira

### Ainda falta:
- **Editar** — será implementado em sessão futura

---

## 🐛 Problemas encontrados e resolvidos

| Problema | Causa | Solução |
|---|---|---|
| Erro `Parameter 'm' implicitly has 'any' type` | Falta de tipagem no `.map()` | Importar `MateriaPrimaModel` com alias |
| `Cannot find module '@/app/generated/prisma'` | Caminho errado no import | Usar caminho relativo `../../generated/prisma/models/MateriaPrima` |
| `Module not found: Can't resolve '../app/generated/prisma'` | `lib/prisma.ts` apontava para pasta sem index | Apontar para `../app/generated/prisma/client` |
| Middleware deprecado no Next.js 16 | Next.js 16 renomeou `middleware.ts` para `proxy.ts` | Rodar `npx @next/codemod@canary middleware-to-proxy . --force` |
| Tela padrão do Next.js na raiz | `app/page.tsx` ainda tinha conteúdo padrão | Substituir por `redirect('/dashboard')` |

---

## ⏭️ O que vem na Sessão 03

1. Página de edição de matéria-prima
2. Feedback visual no formulário (loading, sucesso, erro)
3. Início do módulo de Produtos
4. Possivelmente: início do módulo de Clientes

---

## ⚠️ Pontos de atenção

- O `proxy.ts` foi gerado automaticamente pelo codemod — não editar manualmente sem entender o conteúdo
- O `N` que aparece no canto inferior esquerdo é o indicador do Turbopack em desenvolvimento — desaparece em produção
- O import do tipo `MateriaPrimaModel` usa alias para manter o código legível (`as MateriaPrima`)
- Em sessões futuras, outros módulos precisarão do mesmo padrão de import para seus tipos
