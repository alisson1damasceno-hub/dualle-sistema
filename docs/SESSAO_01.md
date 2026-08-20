# Sessão 01 — Fundação do Projeto Dualle Sistema

**Data:** 18/08/2026  
**Duração estimada:** Sessão completa  
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Criação do projeto Next.js com `create-next-app`
2. Entendimento da estrutura de arquivos gerada
3. Instalação das dependências principais
4. Inicialização e configuração do Prisma
5. Criação do projeto no Supabase
6. Configuração das variáveis de ambiente (`.env`)
7. Escrita do schema do banco de dados
8. Execução da primeira migration — tabelas criadas no Supabase
9. Criação do cliente do Prisma (`lib/prisma.ts`)

---

## 🧠 Conceitos aprendidos

### Node.js e npm
- **`npx`** — executa pacotes sem instalar permanentemente (`Node Package eXecute`)
- **`npm install`** — instala dependências listadas no `package.json`
- **`node_modules/`** — pasta com todas as bibliotecas instaladas; não vai para o GitHub
- **`package.json`** — "documento de identidade" do projeto; lista dependências e scripts
- **`dependencies` vs `devDependencies`** — dependências de produção vs desenvolvimento
- **`.gitignore`** — lista arquivos que o Git deve ignorar (node_modules, .env, etc.)

### Next.js e React
- **App Router** — sistema de roteamento moderno; cada pasta em `app/` vira uma rota
- **`page.tsx`** — arquivo que define o conteúdo de uma rota
- **`layout.tsx`** — esqueleto que envolve todas as páginas; `{children}` é onde o conteúdo de cada página aparece
- **JSX/TSX** — sintaxe que permite escrever HTML dentro de TypeScript
- **`className`** — versão JSX do atributo `class` do HTML
- **`export default`** — exportação principal de um arquivo (uma por arquivo)
- **`export const`** — exportação nomeada (pode ter várias por arquivo)
- **Componentes** — funções que retornam JSX; nome sempre começa com letra maiúscula
- **Props** — dados que um componente recebe de fora; `children` é a prop especial para conteúdo aninhado
- **Template literals** — crases `` ` `` permitem embutir expressões com `${}` em strings
- **`import type`** — importa apenas tipos TypeScript, sem código executável

### TypeScript
- **Tipos** — declarações que dizem ao TypeScript o que uma variável pode conter
- **`?` em tipos** — torna um campo opcional (pode ser `null` ou `undefined`)

### Tailwind CSS
- Classes utilitárias aplicadas direto no JSX (`flex`, `text-3xl`, `bg-zinc-50`, etc.)
- `dark:` — prefixo para estilos no modo escuro
- `sm:` — prefixo para estilos em telas pequenas

### Prisma (ORM)
- **ORM** — camada entre código e banco de dados; traduz TypeScript em SQL
- **`schema.prisma`** — arquivo central; define modelos que viram tabelas
- **`generator client`** — instrui o Prisma a gerar o cliente TypeScript
- **`datasource db`** — configura a conexão com o banco
- **`env("VARIAVEL")`** — lê variável do arquivo `.env`
- **`@id`** — marca campo como chave primária
- **`@default(cuid())`** — gera ID único automaticamente
- **`@default(now())`** — preenche com data/hora atual na criação
- **`@updatedAt`** — atualiza com data/hora atual a cada modificação
- **`@relation`** — define relacionamentos entre tabelas
- **`@@unique`** — garante unicidade de combinação de campos
- **`Decimal`** — tipo correto para valores monetários (evita imprecisão do Float)
- **Migration** — arquivo SQL gerado pelo Prisma que cria/altera tabelas no banco
- **`prisma migrate dev`** — cria e aplica a migration no banco
- **`directUrl`** — URL de conexão direta necessária para migrations (sem pooler)

### Supabase e PostgreSQL
- **Supabase** — plataforma que provê PostgreSQL gerenciado + autenticação + API
- **Connection pooler** — gerenciador de conexões; agrupa conexões em ambientes serverless
- **`DATABASE_URL`** — conexão via pooler (para queries normais)
- **`DIRECT_URL`** — conexão direta (para migrations)
- **RLS (Row Level Security)** — segurança por linha no PostgreSQL
- **Publishable key** — chave segura para uso no frontend
- **Secret key** — chave privilegiada; nunca vai para o frontend ou GitHub
- **`ON DELETE RESTRICT`** — impede deletar registro com dependências
- **`ON DELETE SET NULL`** — ao deletar, seta o campo como null em vez de deletar
- **`ON DELETE CASCADE`** — ao deletar, deleta também os dependentes
- **Foreign Key** — campo que referencia a chave primária de outra tabela

### Variáveis de Ambiente
- **`.env`** — arquivo para guardar credenciais fora do código
- **`NEXT_PUBLIC_`** — prefixo que torna a variável acessível no frontend

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── prisma/
│   ├── schema.prisma          ← modelos do banco de dados
│   └── migrations/
│       └── 20260819023110_init/
│           └── migration.sql  ← SQL gerado e aplicado no banco
├── lib/
│   └── prisma.ts              ← cliente do Prisma (singleton)
├── prisma.config.ts           ← configuração do Prisma (dotenv)
└── .env                       ← variáveis de ambiente (não vai pro GitHub)
```

---

## 🗃️ Schema do banco de dados

```
Cliente → Pedido → ItemPedido → Produto → ItemFicha → MateriaPrima
```

### Modelos criados:
- **Cliente** — nome, whatsapp, instagram, canal de origem
- **MateriaPrima** — nome, unidade, preço unitário
- **Produto** — nome, categoria, descrição, margem de lucro, ativo
- **ItemFicha** — liga Produto ↔ MateriaPrima com quantidade (ficha técnica)
- **Pedido** — cliente (opcional), canal, canalPedidoId, status, prazo, pago
- **ItemPedido** — liga Pedido ↔ Produto com quantidade, preço snapshot e especificações

### Decisões de design importantes:
- `clienteId` é opcional no Pedido — permite pedidos sem cliente cadastrado (ex: Shopee)
- `canal` e `canalPedidoId` no Pedido — rastreia origem e ID externo do pedido
- `precoUnitario` no ItemPedido — snapshot do preço no momento do pedido (histórico)
- `ativo` no Produto — desativar em vez de deletar (preserva histórico)
- `especificacoes` no ItemPedido — texto livre para personalização

---

## 📦 Dependências instaladas

```json
"dependencies": {
  "next": "...",
  "react": "...",
  "react-dom": "...",
  "prisma": "6.11.0",
  "@prisma/client": "6.11.0",
  "@supabase/supabase-js": "...",
  "@supabase/ssr": "...",
  "lucide-react": "...",
  "dotenv": "..."
}
```

---

## ⏭️ O que vem na Sessão 02

1. Criar o cliente do Supabase (`lib/supabase.ts`) para autenticação
2. Configurar autenticação com Supabase Auth (login/logout)
3. Criar o middleware de proteção de rotas
4. Montar o layout mobile-first com navegação inferior
5. Começar o CRUD de Matérias-Primas

---

## ⚠️ Pontos de atenção para a próxima sessão

- O `prisma.config.ts` ainda mostra erro vermelho no VS Code — é visual, não funcional
- As chaves `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY` estão no `.env` mas ainda não foram usadas no código
- O cliente do Prisma (`lib/prisma.ts`) foi criado mas ainda não foi testado
