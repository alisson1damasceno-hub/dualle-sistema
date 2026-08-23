# Sessão 05 — Preço de Venda, Ficha Técnica e Cálculo de Custo

**Data:** 23/08/2026
**Status:** ✅ Concluída

---

## 🎯 O que foi feito nessa sessão

1. Migration para adicionar `precoVenda` no modelo `Produto`
2. Margem de lucro padrão ajustada de 60% para 30% (decisão da dona do negócio)
3. Ficha Técnica implementada na página de edição de produto
4. Cálculo automático de custo total e preço sugerido
5. Proteção contra duplicatas na ficha técnica (mesma matéria-prima duas vezes)
6. Campo `precoVenda` salvo corretamente via `atualizarProduto`
7. Dois commits no GitHub

---

## 🧠 Conceitos aprendidos

### Por que `Decimal?` com `?` (nullable)
O `?` no Prisma/TypeScript torna o campo opcional — no banco vira uma coluna que aceita `NULL`. Usado em `precoVenda` porque o produto pode existir sem preço de venda definido: é preenchido depois que a ficha técnica estiver montada. Campos obrigatórios não têm `?`; campos que fazem sentido existir vazios levam `?`.

### `Promise.all([...])` — buscas paralelas
Quando uma página precisa de múltiplos dados independentes do banco, em vez de esperar uma busca terminar para começar a próxima:
```typescript
// ❌ sequencial — uma espera a outra
const itensFicha = await listarItensFicha(id)
const materiasPrimas = await listarMateriasPrimas()

// ✅ paralelo — dispara as duas ao mesmo tempo
const [itensFicha, materiasPrimas] = await Promise.all([
  listarItensFicha(id),
  listarMateriasPrimas(),
])
```
`Promise.all` retorna um array com os resultados na mesma ordem das promises. A desestruturação `[a, b]` extrai cada resultado para sua variável. Economiza tempo de resposta quando as queries são independentes.

### `Array.reduce()` — acumular um valor
Método que percorre um array e "acumula" um resultado. Muito usado para somar valores:
```typescript
const custoTotal = itensFicha.reduce((acc, item) => {
  return acc + Number(item.quantidade) * Number(item.materiaPrima.precoUnitario)
}, 0)
// acc começa em 0, e a cada item soma o custo parcial daquele item
```
`acc` (acumulador) é o valor que vai sendo construído a cada iteração. O `0` ao final é o valor inicial do acumulador.

### Cálculo de preço sugerido — margem sobre preço de venda
A fórmula usada **não** é markup simples (custo × (1 + margem%)). É margem sobre o preço final:
```
precoSugerido = custo / (1 - margem)
```
Exemplo: custo R$ 25,00, margem 15% → R$ 25,00 / (1 - 0,15) = R$ 25,00 / 0,85 = **R$ 29,41**

Isso significa: R$ 29,41 é o preço em que R$ 25,00 representa 85% (custo) e R$ 4,41 representa 15% (lucro). Diferente do markup: custo × 1,15 = R$ 28,75 — nesse caso a margem real sobre o preço seria menor que 15%.

### `include` no Prisma — JOIN automático
Quando uma query precisa de dados de uma tabela relacionada:
```typescript
prisma.itemFicha.findMany({
  where: { produtoId },
  include: { materiaPrima: true }, // traz o objeto MateriaPrima completo
})
```
Sem `include`, teríamos apenas `materiaPrimaId` (string). Com `include`, cada `ItemFicha` retorna com `item.materiaPrima.nome`, `item.materiaPrima.precoUnitario`, etc. O Prisma faz o JOIN no SQL por baixo.

### Chave composta no Prisma — `@@unique` e `findUnique`
O schema define `@@unique([produtoId, materiaPrimaId])` no `ItemFicha`, impedindo a mesma matéria-prima aparecer duas vezes na ficha de um produto. Para buscar por essa chave composta:
```typescript
prisma.itemFicha.findUnique({
  where: {
    produtoId_materiaPrimaId: { produtoId, materiaPrimaId },
  },
})
```
O Prisma gera automaticamente o nome `produtoId_materiaPrimaId` concatenando os campos do `@@unique` com underscore.

### Hard delete vs soft delete — quando usar cada um
- **Soft delete** (`ativo: false`) — usado em entidades que têm histórico: Cliente, Produto, MatériaPrima. Um cliente inativado ainda aparece em pedidos antigos.
- **Hard delete** (`prisma.itemFicha.delete()`) — usado em registros sem histórico próprio. `ItemFicha` representa a composição *atual* do produto. Se você remove um ingrediente, é porque o produto mudou — não há histórico para preservar. O histórico que importa está no `precoUnitario` do `ItemPedido`, não na ficha técnica.

### Campo `precoVenda` — tratamento de campo opcional numérico
Campos opcionais numéricos precisam de tratamento especial no formulário:
```typescript
const precoVendaRaw = formData.get('precoVenda') as string
const precoVenda = precoVendaRaw ? parseFloat(precoVendaRaw) : null
```
`formData.get()` retorna string vazia `""` quando o campo está vazio, não `null`. O operador ternário converte string vazia para `null` (para salvar NULL no banco) ou converte para número se houver valor.

### Fluxo em duas etapas — produto antes, ficha depois
A ficha técnica só pode ser montada depois que o produto existe, porque `ItemFicha` precisa do `produtoId`. Isso é um padrão comum em sistemas reais chamado **fluxo em duas etapas**: primeiro cria a entidade principal, depois complementa com dados relacionados. ERPs profissionais funcionam assim.

### Unidade de medida — texto livre
O campo `unidade` em `MatériaPrima` é texto livre. O sistema não interpreta nem converte unidades — apenas exibe. O preço deve ser cadastrado já na unidade correta (ex: R$ 0,05/ml, não R$ 50/L). Melhoria futura: substituir por `<select>` com opções padronizadas ("un", "ml", "L", "g", "kg", "m").

---

## 📁 Arquivos criados/modificados

```
dualle-sistema/
├── prisma/
│   ├── schema.prisma                                         ← precoVenda adicionado em Produto; margemLucro default 60→30
│   └── migrations/
│       └── 20260823030544_add_preco_venda_produto/
│           └── migration.sql                                 ← ALTER TABLE ADD COLUMN precoVenda
└── app/
    └── (protected)/
        └── produtos/
            ├── actions.ts                                    ← atualizarProduto + precoVenda; listarItensFicha; adicionarItemFicha; removerItemFicha
            └── [id]/
                └── editar/
                    └── page.tsx                              ← seção Ficha Técnica; Promise.all; cálculo custo/preço sugerido
```

---

## 🗃️ Estado atual dos módulos

| Módulo | Listar | Criar | Editar | Inativar | Reativar | Ficha Técnica |
|---|---|---|---|---|---|---|
| Matérias-Primas | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Produtos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Pedidos | ❌ | ❌ | ❌ | — | — | — |

---

## ⏭️ O que vem na Sessão 06

1. Módulo de Pedidos — estrutura completa
   - Listar pedidos com status e cliente
   - Criar pedido (com ou sem cliente — `clienteId` opcional)
   - Adicionar itens ao pedido (Produto + quantidade + `precoUnitario` snapshot)
   - Atualizar status do pedido (aguardando → produção → pronto → entregue)

---

## ⚠️ Pontos de atenção / melhorias futuras

- **Feedback de duplicata na ficha técnica** — ao tentar adicionar uma matéria-prima já existente na ficha, o sistema silencia o erro (não duplica, não quebra, mas não avisa). Melhoria futura: retornar estado de erro da Server Action e exibir mensagem na tela. Alternativa mais simples: filtrar do `<select>` as matérias-primas já adicionadas.
- **Preço na listagem de produtos** — `precoVenda` e custo calculado só aparecem na tela de edição. Avaliar se faz sentido mostrar na listagem também.
- **Unidade de medida** — hoje é texto livre; padronizar com `<select>` no futuro.
- **`BotaoSubmit.tsx` duplicado** — ainda idêntico nos três módulos; candidato a componente compartilhado em `components/`.
- **Filtro ativos/inativos no JS** — adequado para volume atual; migrar para `where: { ativo: true }` no Prisma quando o sistema crescer.
- **Audit log** — histórico de ativações/inativações/edições; implementar após módulo de Pedidos.
- **Aviso de item inativado em uso** — depende das relações com Pedidos estarem implementadas.
