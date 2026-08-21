# Sessão 03 — Git/GitHub, Edição de Matérias-Primas e Módulo de Produtos

**Data:** 20/08/2026
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Git e GitHub configurados — projeto versionado e hospedado remotamente
2. Página de edição de matéria-prima criada (rota dinâmica `[id]`)
3. Redirecionamento após salvar implementado com `redirect()`
4. Feedback visual de loading no botão com `useFormStatus`
5. Módulo de Produtos criado com CRUD completo (listar, criar, editar, deletar)
6. Navegação inferior atualizada com item "Produtos"

---

## 🧠 Conceitos aprendidos

### Git e GitHub
- **Git** — ferramenta local que rastreia o histórico de alterações do código
- **GitHub** — plataforma na nuvem que hospeda repositórios Git
- **`git init`** — inicializa um repositório Git em uma pasta (o `create-next-app` já faz isso automaticamente)
- **`git status`** — mostra o estado atual: arquivos modificados, não rastreados, prontos para commit
- **`git add .`** — adiciona todos os arquivos ao "stage" (área de preparação para o commit)
- **`git commit -m "mensagem"`** — cria um ponto de save no histórico com uma mensagem descritiva
- **`git remote add origin <url>`** — conecta o repositório local ao repositório remoto no GitHub
- **`git branch -M main`** — renomeia o branch de `master` para `main` (padrão atual do GitHub)
- **`git push -u origin main`** — envia o código para o GitHub; o `-u` configura rastreamento para que nas próximas vezes basta `git push`
- **Conventional Commits** — convenção de prefixos para mensagens: `feat:` (nova funcionalidade), `fix:` (correção), `chore:` (manutenção), etc.

### Next.js — Rotas Dinâmicas
- **Segmento dinâmico** — pasta com nome entre colchetes: `[id]`; captura qualquer valor naquela posição da URL
- **`params`** — prop especial que toda página recebe com os segmentos dinâmicos da URL
- **`params: Promise<{ id: string }>`** — no Next.js App Router moderno, `params` é uma Promise; precisa de `await` para extrair o valor
- **Exemplo:** URL `/materias-primas/abc123/editar` → `params = { id: "abc123" }`

### Prisma — Novas operações
- **`findUnique()`** — busca exatamente um registro pelo campo único (geralmente o `id`); retorna o objeto ou `null`
- **`update()`** — atualiza um registro existente; recebe `where` (qual registro) e `data` (campos a alterar); campos não incluídos em `data` ficam intactos

### Server Actions — Padrões avançados
- **`redirect()` em Server Actions** — importado de `next/navigation`; interrompe a execução e instrui o cliente a navegar para outra URL; deve vir após o `revalidatePath()`
- **`.bind(null, id)`** — "congela" o primeiro argumento de uma função; `atualizarMateriaPrima.bind(null, id)` cria uma nova função que quando chamada com `(formData)` na prática chama `atualizarMateriaPrima(id, formData)`; o `null` é o contexto (`this`) obrigatório na sintaxe do `.bind()`

### React — `useFormStatus`
- **`useFormStatus`** — hook do React (importado de `react-dom`) que permite a um componente filho saber se o formulário pai está sendo enviado
- **`pending`** — propriedade retornada pelo hook; é `true` enquanto o formulário processa, `false` quando termina
- **Regra importante:** `useFormStatus` só funciona em um componente que é **filho** do `<form>` — não pode ser usado na mesma página onde o `<form>` está; por isso criamos um componente separado `BotaoSubmit`
- **`"use client"`** — obrigatório no componente que usa `useFormStatus`, pois hooks só funcionam no cliente; a página pai continua sendo Server Component

### TypeScript e JSX
- **Operador `??` (nullish coalescing)** — retorna o valor da direita apenas se o da esquerda for `null` ou `undefined`; diferente do `||`, não substitui string vazia
  - `produto.categoria ?? 'Sem categoria'` → exibe "Sem categoria" apenas se `categoria` for `null`
  - `produto.categoria ?? ''` → exibe string vazia no input para o usuário poder editar
- **`{!p.ativo && <span>inativo</span>}`** — renderização condicional em JSX; só renderiza o elemento se a condição for verdadeira
- **Operador ternário** — `{pending ? 'Salvando...' : 'Salvar alterações'}` — se `pending` verdadeiro, mostra o primeiro valor; senão, o segundo

### Tailwind CSS
- **`disabled:opacity-50`** — aplica 50% de opacidade quando o elemento está desabilitado; funciona como `hover:` mas para o estado `disabled`
- **`transition-opacity`** — anima a mudança de opacidade suavemente

### Decisões de produto
- **Ficha técnica separada do CRUD básico** — a relação Produto ↔ MateriaPrima (many-to-many via `ItemFicha`) é mais complexa e fica para sessão futura
- **Preço de venda manual vs calculado** — decidido que o sistema vai sugerir um preço com base na ficha técnica e margem, mas a dona do negócio pode sobrescrever com o valor que quiser; campo `precoVenda` será adicionado ao modelo `Produto` em sessão futura via migration

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── app/
│   └── (protected)/
│       ├── layout.tsx                          ← adicionado item "Produtos" na nav
│       ├── materias-primas/
│       │   ├── actions.ts                      ← adicionados buscar + atualizar + redirect
│       │   ├── page.tsx                        ← adicionado botão de editar (lápis)
│       │   └── [id]/
│       │       └── editar/
│       │           ├── page.tsx                ← página de edição com campos pré-preenchidos
│       │           └── BotaoSubmit.tsx         ← botão com loading via useFormStatus
│       └── produtos/
│           ├── actions.ts                      ← CRUD completo de produtos
│           ├── page.tsx                        ← listagem + formulário de cadastro
│           └── [id]/
│               └── editar/
│                   ├── page.tsx                ← página de edição de produto
│                   └── BotaoSubmit.tsx         ← mesmo padrão de matérias-primas
```

---

## 🗃️ CRUD de Produtos

### Campos do formulário de cadastro:
- **nome** — obrigatório
- **categoria** — opcional (ex: Canecas, Sandálias)
- **margemLucro** — obrigatório, padrão 60%

### Campos disponíveis na edição (além dos acima):
- **descricao** — opcional, texto livre

### Ainda falta (próximas sessões):
- **Ficha técnica** — ligar Produto ↔ MateriaPrima com quantidades
- **`precoVenda`** — campo para a dona sobrescrever o preço sugerido
- **Cálculo de custo** — soma automática com base na ficha técnica

---

## 🔄 Padrão consolidado para novos módulos

Cada módulo segue a mesma estrutura:

```
app/(protected)/[modulo]/
├── actions.ts              → listar, buscar, criar, atualizar (+ redirect), deletar
├── page.tsx                → Server Component; lista + formulário de cadastro
└── [id]/
    └── editar/
        ├── page.tsx        → busca o item, pré-preenche o form, usa BotaoSubmit
        └── BotaoSubmit.tsx → "use client"; useFormStatus; botão com loading
```

---

## 🐛 Problemas encontrados e resolvidos

| Problema | Causa | Solução |
|---|---|---|
| `Ctrl+H` não encontrava o bloco para substituir | Blocos multilinhas são difíceis de colar no Find & Replace | Usar `Ctrl+G` para ir à linha, selecionar manualmente e substituir |

---

## ⏭️ O que vem na Sessão 04

1. Módulo de Clientes (CRUD completo — mesmo padrão já consolidado)
2. Ficha técnica de Produtos (relacionamento many-to-many Produto ↔ MateriaPrima)
3. Migration para adicionar `precoVenda` no modelo Produto
4. Início do módulo de Pedidos

---

## ⚠️ Pontos de atenção

- O `BotaoSubmit.tsx` é idêntico em matérias-primas e produtos — em sessão futura pode virar um componente compartilhado em `components/`
- A margem de lucro padrão de 60% está no `defaultValue` do formulário e no schema (`@default(60)`) — revisar com a dona do negócio qual percentual faz sentido
- A fórmula de precificação (markup vs margem real) ainda não foi decidida — deixar para quando a ficha técnica estiver pronta
- O `redirect()` em Server Actions funciona lançando uma exceção interna do Next.js — por isso não precisa de `return` antes dele
