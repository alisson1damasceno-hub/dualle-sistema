# Sessão 06 — Módulo de Pedidos, Dashboard e Endereço

**Data:** 23/08/2026
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Módulo de Pedidos criado com fluxo completo (criar, listar, detalhar, adicionar itens, remover itens)
2. Controle de status implementado com progressão linear (aguardando → produção → pronto → entregue)
3. Snapshot de preço no `ItemPedido.precoUnitario` (preço capturado no momento da venda)
4. Toggle de pagamento (pago / não pago) na página de detalhe e na listagem
5. Página de detalhe do cliente com visão 360° (informações + resumo + pedidos)
6. Dashboard com métricas reais (pedidos por status, valor em aberto, não recebido, alertas)
7. Campo `endereco` adicionado ao modelo `Pedido` via migration
8. Resolução de problema de drift no banco (reset via SQL Editor do Supabase + `migrate deploy`)
9. Deploy no Vercel — sistema em produção acessível pelo celular
10. Correção de três erros de build no Vercel (`earlyAccess`, `prisma generate`, layout responsivo)
11. Seis commits no GitHub

---

## 🧠 Conceitos aprendidos

### Fluxo mestre-detalhe (master-detail)
Padrão comum em sistemas reais onde a entidade principal (mestre) precisa existir antes dos itens relacionados (detalhe). `ItemPedido` precisa do `pedidoId` para existir — esse ID só é gerado após o `Pedido` ser salvo. Mesmo princípio da ficha técnica de produtos. ERPs como SAP e TOTVS funcionam assim.

### Snapshot de preço — integridade histórica
```typescript
const produto = await prisma.produto.findUnique({ where: { id: produtoId } })
await prisma.itemPedido.create({
  data: {
    precoUnitario: produto.precoVenda, // ← salva o preço AGORA
  }
})
```
O preço é capturado no momento da venda e salvo no `ItemPedido`. Se o preço do produto mudar depois, os pedidos antigos continuam com o preço original. Isso preserva a rastreabilidade financeira do negócio.

### `STATUS_ORDEM` — progressão de status sem if/else
```typescript
const STATUS_ORDEM = ['aguardando', 'producao', 'pronto', 'entregue']
const proximoStatus = STATUS_ORDEM[STATUS_ORDEM.indexOf(statusAtual) + 1] ?? null
```
Em vez de uma cadeia de `if/else` para descobrir qual é o próximo status, usamos `indexOf` para achar a posição atual no array e somamos 1. Se não há próximo, retorna `undefined` e o `?? null` converte para `null` — o botão de avançar some automaticamente quando o pedido está em "entregue".

### `Record<string, { label: string; cor: string }>` — dicionário de configuração
Tipo TypeScript para objetos onde as chaves são strings e os valores têm formato fixo. Usado para mapear status → label e cor visual sem repetir código:
```typescript
const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  aguardando: { label: 'Aguardando', cor: 'bg-yellow-100 text-yellow-800' },
  producao:   { label: 'Em produção', cor: 'bg-blue-100 text-blue-800' },
  // ...
}
// Uso: STATUS_CONFIG[pedido.status].label
```

### `parseInt` vs `parseFloat`
- **`parseFloat`** — para números decimais: preços, quantidades de matéria-prima (1,5 kg)
- **`parseInt`** — para números inteiros: quantidade de produtos num pedido (não faz sentido pedir 1,5 canecas)

### `new Date(string)` — conversão de data
Campos `<input type="date">` enviam strings no formato `"2026-09-01"`. O banco espera um objeto `Date`. A conversão é feita com `new Date(prazoRaw)`. O formato americano exibido pelo input (`mm/dd/yyyy`) é controlado pelo navegador/SO e não pode ser alterado via HTML — a data é exibida em formato brasileiro apenas após salva, usando `toLocaleDateString('pt-BR')`.

### `toLocaleDateString('pt-BR')` — formatação de data
Converte um objeto `Date` para string no formato brasileiro:
```typescript
new Date(pedido.prazo).toLocaleDateString('pt-BR')
// → "26/08/2026"

new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
// → "domingo, 23 de agosto"
```
O segundo argumento é um objeto de opções que controla quais partes da data aparecem e em qual formato.

### `hoje.setHours(0, 0, 0, 0)` — comparação de datas sem hora
`new Date()` captura data e hora atual (ex: 23/08/2026 15:42:33). Para comparar só a data e detectar pedidos atrasados sem marcar pedidos com prazo "hoje" como atrasados, zeramos as horas:
```typescript
const hoje = new Date()
hoje.setHours(0, 0, 0, 0) // → 23/08/2026 00:00:00
const atrasado = p.prazo && new Date(p.prazo) < hoje
```

### `.slice(início, fim)` — fatia de array
Retorna uma parte do array sem modificar o original:
```typescript
pedidos.slice(0, 5) // → primeiros 5 pedidos
```
Usado no dashboard para mostrar apenas os 5 pedidos mais recentes.

### `reduce` aninhado — total gasto por cliente
Para calcular o total gasto por um cliente, precisamos somar os totais de todos os pedidos, e cada pedido tem seus próprios itens:
```typescript
const totalGasto = cliente.pedidos.reduce((acc, pedido) => {
  return acc + pedido.itens.reduce(
    (a, item) => a + Number(item.precoUnitario) * item.quantidade, 0
  )
}, 0)
```
O `reduce` externo percorre os pedidos; o interno soma os itens de cada pedido.

### `grid-cols-3` — grid de 3 colunas no Tailwind
```tsx
<div className="grid grid-cols-3 gap-3">
  <div>card 1</div>
  <div>card 2</div>
  <div>card 3</div>
</div>
```
Divide o espaço em 3 colunas iguais. Cada filho ocupa automaticamente uma coluna.

### Query direta no Prisma vs `actions.ts`
No Dashboard as queries são feitas diretamente na página (`prisma.pedido.findMany()`) sem passar por um `actions.ts`. Isso é correto quando:
- São apenas leituras (não mutações)
- A lógica é específica dessa página e não será reutilizada em outro lugar

Quando a função vai ser chamada de múltiplos lugares, coloca em `actions.ts`. Quando é exclusiva de uma página, pode ficar na própria página.

### Visão 360° do cliente
Página de detalhe que agrega em um único lugar todas as informações relevantes de um cliente: dados de contato, métricas (total de pedidos, em aberto, total gasto) e histórico completo de pedidos. Padrão comum em sistemas CRM (Customer Relationship Management).

### `p.cliente?.nome ?? 'Sem cliente'` — optional chaining + nullish coalescing
Dois operadores em sequência:
- `?.` (optional chaining) — acessa `nome` só se `cliente` não for `null`; sem isso daria erro em pedidos sem cliente
- `??` (nullish coalescing) — retorna `'Sem cliente'` se o resultado anterior for `null` ou `undefined`

### Drift de banco e como resolver
**Drift** ocorre quando o estado real do banco diverge do histórico de migrations do Prisma. Causas comuns: migrations aplicadas manualmente, alterações diretas no banco, ou problemas de sincronização.

Solução usada:
1. Reset do banco via SQL Editor do Supabase (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`)
2. `npx prisma migrate deploy` — aplica todas as migrations em ordem usando a `DATABASE_URL` (pooler), sem precisar da `DIRECT_URL`

**`migrate deploy` vs `migrate dev`:**
- `migrate dev` — para desenvolvimento; detecta mudanças, cria novas migrations, precisa da `DIRECT_URL`
- `migrate deploy` — para produção/CI; apenas aplica migrations existentes, usa a `DATABASE_URL`

### IPv4 vs IPv6 no Supabase free tier
O Supabase free tier só oferece conexão direta (`DIRECT_URL`) via IPv6. Máquinas com IPv4 (maioria das redes domésticas) não conseguem alcançar a porta 5432 diretamente — daí o erro `P1001`. A solução é usar `migrate deploy` que passa pelo pooler (IPv4 compatível), ou habilitar o IPv4 add-on (pago) no Supabase.

### Deploy contínuo no Vercel
O Vercel monitora o repositório GitHub. Todo `git push` na branch `main` dispara automaticamente um novo build e deploy em produção — sem precisar fazer nada manualmente. Isso se chama **CI/CD** (Continuous Integration / Continuous Deployment).

### Erros de build no Vercel — o que aprendemos
Três problemas encontrados e resolvidos:

1. **`earlyAccess` faltando** — o `prisma.config.ts` precisava de `earlyAccess: true` para funcionar no ambiente de build do Vercel
2. **`prisma generate` não rodava** — o Vercel não executa o postinstall do Prisma automaticamente; solução: adicionar `prisma generate &&` antes do `next build` no `package.json`
3. **Layout quebrando no mobile** — `flex` sem `flex-col` no mobile fazia campos extravasarem a tela; solução: `flex-col sm:flex-row`

### Design responsivo — mobile-first com Tailwind
O Tailwind usa prefixos de breakpoint para sobrescrever estilos em telas maiores:
```tsx
// Mobile: coluna | Tablet+: linha
<div className="flex flex-col sm:flex-row gap-2">
```
- Sem prefixo → vale para todos os tamanhos (mobile first)
- `sm:` → aplica em telas ≥ 640px
- `md:` → aplica em telas ≥ 768px
- `lg:` → aplica em telas ≥ 1024px

### LF vs CRLF — aviso do Git no Windows
Windows usa `CRLF` (dois caracteres) para quebrar linhas; Linux/Mac usam `LF` (um caractere). O aviso `LF will be replaced by CRLF` é o Git informando que vai converter automaticamente — não é um erro, não afeta o funcionamento.

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── prisma/
│   ├── schema.prisma                                      ← endereco adicionado em Pedido
│   └── migrations/
│       └── 20260824000117_add_endereco_pedido/
│           └── migration.sql                              ← ALTER TABLE ADD COLUMN endereco
└── app/
    └── (protected)/
        ├── dashboard/
        │   └── page.tsx                                   ← dashboard com métricas reais
        ├── clientes/
        │   ├── page.tsx                                   ← nome do cliente virou link
        │   └── [id]/
        │       └── page.tsx                               ← página de detalhe do cliente (nova)
        ├── materias-primas/
        │   └── page.tsx                                   ← flex-col sm:flex-row (responsivo)
        └── pedidos/
            ├── actions.ts                                 ← CRUD completo de pedidos
            ├── page.tsx                                   ← listagem + formulário de criação
            └── [id]/
                └── page.tsx                               ← detalhe + itens + status + endereço
package.json                                               ← prisma generate && next build
prisma.config.ts                                           ← earlyAccess: true
```

---

## 🗃️ Estado atual dos módulos

| Módulo | Listar | Criar | Editar | Inativar | Reativar | Detalhe |
|---|---|---|---|---|---|---|
| Matérias-Primas | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Produtos | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Clientes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pedidos | ✅ | ✅ | ❌ | — | — | ✅ |

---

## ⏭️ O que vem na Sessão 07

1. **Identidade visual Dualle** — aplicar paleta de cores da marca (rosa #E8638C, azul #4A6FA5, dourado #C9A84C) em botões, navegação e destaques
2. **Editar pedido** — poder corrigir canal, prazo, endereço e observações após criação
3. **Consistência visual** — atualizar a tela de Clientes para o padrão visual de Pedidos/Dashboard
4. **Produtos sem preço** — aviso visual na listagem de produtos sem `precoVenda`
5. **`BotaoSubmit` compartilhado** — consolidar os três componentes idênticos em um só

---

## ⚠️ Pontos de atenção / melhorias futuras

- **Editar pedido** — não é possível corrigir canal, prazo, endereço ou observações após criação; implementar na Sessão 07
- **Endereço não aparece na listagem** — só visível na página de detalhe; avaliar se faz sentido mostrar na lista
- **IPv4 no Supabase** — `DIRECT_URL` não funciona em redes IPv4 sem o add-on pago; usar sempre `migrate deploy` em vez de `migrate dev` para sincronizar o banco
- **`BotaoSubmit.tsx` duplicado** — ainda idêntico nos três módulos; candidato a componente compartilhado em `components/`
- **Filtro de ativos/inativos no JS** — adequado para volume atual; migrar para `where: { ativo: true }` no Prisma quando o sistema crescer
- **Audit log** — histórico de ativações/inativações/edições; implementar após estabilizar os módulos principais
- **Produtos sem preço de venda** — sistema silencia quando tenta adicionar ao pedido; adicionar feedback visual na listagem de produtos
- **Consistência visual** — tela de Clientes usa estilo mais antigo (botão azul, cards diferentes); padronizar na Sessão 07
