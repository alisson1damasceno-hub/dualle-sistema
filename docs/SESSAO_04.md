# Sessão 04 — Módulo de Clientes e Soft Delete

**Data:** 22/08/2026
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Módulo de Clientes criado com CRUD completo (listar, criar, editar, inativar, reativar)
2. Conceito de soft delete introduzido e implementado nos três módulos
3. Campo `ativo` adicionado em `Cliente` e `MateriaPrima` via migration
4. Seção de inativos com reativação implementada em Clientes, Produtos e Matérias-Primas
5. Commit e push no GitHub

---

## 🧠 Conceitos aprendidos

### Soft Delete vs Hard Delete
- **Hard delete** — `prisma.modelo.delete()` — apaga o registro permanentemente do banco; destrói rastreabilidade e pode quebrar foreign keys
- **Soft delete** — troca o `delete()` por um `update({ ativo: false })`; o registro continua no banco mas é tratado como inexistente nas listagens normais
- **Por que isso importa:** um cliente com pedidos históricos não pode simplesmente desaparecer; os pedidos continuam rastreáveis mesmo após a "exclusão"
- **`@default(true)` na migration** — quando adicionamos uma coluna nova em tabela com dados existentes, o banco precisa de um valor padrão; `@default(true)` garante que todos os registros existentes continuem como ativos

### Audit Log (conceito para sessão futura)
- Registro de eventos que documenta o que aconteceu, quando e em qual item
- Exemplos: "Cliente X foi inativado em 22/08", "Produto Y foi reativado em 23/08"
- Será implementado como tabela separada no banco em sessão futura

### Decisões de produto tomadas nessa sessão
- Itens inativos: só visualização, sem edição, sem uso em novas operações
- Reativação disponível a qualquer momento
- Operações já realizadas antes da inativação continuam válidas (rastreabilidade preservada)
- Futuro: aviso quando um item inativado ainda é referenciado em operações ativas

### Escalabilidade — filtro no JS vs no banco
- **Filtro no JS (atual):** `findMany()` traz tudo, `.filter()` separa ativos/inativos no JavaScript — simples, adequado para volumes pequenos
- **Filtro no banco (futuro):** dois `findMany()` com `where: { ativo: true }` e `where: { ativo: false }` — mais eficiente para grandes volumes
- A troca é simples e pode ser feita quando necessário sem mudar a estrutura das páginas

### Tailwind CSS — novidades
- **`opacity-50`** — aplica 50% de opacidade ao elemento e todos os seus filhos; usado para sinalizar visualmente que um item está inativo
- **`uppercase tracking-wide`** — texto em maiúsculas com espaçamento entre letras; usado no cabeçalho da seção "INATIVOS"
- **`shrink-0`** — impede que um elemento flex encolha quando o conteúdo ao lado é muito longo; essencial para manter os botões de ação sempre visíveis

### Lucide React — novos ícones
- **`ArchiveX`** — ícone de arquivo com X; usado para inativar (semanticamente: "arquivar e cancelar")
- **`ArchiveRestore`** — ícone de arquivo com seta de retorno; usado para reativar
- **`title="..."`** — atributo HTML que exibe tooltip ao passar o mouse; importante quando se usa ícones sem texto para acessibilidade

### `notFound()` do Next.js
- Importado de `next/navigation`
- Usado na página de edição quando o ID da URL não existe no banco
- Exibe automaticamente uma página 404 em vez de quebrar tentando acessar propriedades de `null`
- Diferença do `redirect()`: `redirect()` leva para outra página; `notFound()` encerra a renderização com erro 404

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── app/
│   └── (protected)/
│       ├── clientes/                           ← módulo novo
│       │   ├── actions.ts                      ← listar, buscar, criar, atualizar, inativar, reativar
│       │   ├── page.tsx                        ← listagem com seção de ativos e inativos
│       │   └── [id]/
│       │       └── editar/
│       │           ├── page.tsx                ← edição com notFound()
│       │           └── BotaoSubmit.tsx         ← padrão useFormStatus
│       ├── materias-primas/
│       │   ├── actions.ts                      ← deletar → inativar + reativar
│       │   └── page.tsx                        ← listagem com seção de ativas e inativas
│       └── produtos/
│           ├── actions.ts                      ← deletar → inativar + reativar
│           └── page.tsx                        ← listagem com seção de ativos e inativos
└── prisma/
    ├── schema.prisma                           ← ativo adicionado em Cliente e MateriaPrima
    └── migrations/
        └── 20260822162035_add_ativo_cliente_materia_prima/
            └── migration.sql                   ← ALTER TABLE com DEFAULT true
```

---

## 🗃️ Estado atual dos módulos

| Módulo | Listar | Criar | Editar | Inativar | Reativar |
|---|---|---|---|---|---|
| Matérias-Primas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Produtos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pedidos | ❌ | ❌ | ❌ | — | — |

---

## ⏭️ O que vem na Sessão 05

1. Migration para adicionar `precoVenda` no modelo `Produto`
2. Ficha técnica de Produtos — relacionamento many-to-many `Produto ↔ MatériaPrima` via `ItemFicha`
3. Início do módulo de Pedidos

---

## ⚠️ Pontos de atenção

- O `BotaoSubmit.tsx` é idêntico nos três módulos — candidato a componente compartilhado em `components/` em sessão futura
- O filtro de ativos/inativos é feito no JavaScript (`Array.filter`) — adequado para o volume atual; migrar para `where: { ativo: true }` no Prisma quando o sistema crescer
- A página de edição de Clientes **não verifica** se o cliente está inativo antes de permitir edição — a proteção existe apenas na UI (sem botão de editar nos inativos); considerar adicionar verificação no servidor futuramente
- Audit log (histórico de ativações/inativações/edições) foi discutido mas não implementado — fica para sessão futura após o módulo de Pedidos estar completo
- Aviso de "item inativado em uso" também fica para sessão futura — depende das relações com Pedidos estarem implementadas
