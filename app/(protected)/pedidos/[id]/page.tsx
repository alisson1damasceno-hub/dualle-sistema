import { notFound } from 'next/navigation'
import { buscarPedidoPorId, adicionarItemPedido, removerItemPedido, atualizarStatusPedido, alternarPagamento } from '../actions'
import { listarProdutos } from '../../produtos/actions'
import { Package, Trash2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const STATUS_ORDEM = ['aguardando', 'producao', 'pronto', 'entregue']

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  aguardando: { label: 'Aguardando',  cor: 'bg-yellow-100 text-yellow-800' },
  producao:   { label: 'Em produção', cor: 'bg-blue-100 text-blue-800'   },
  pronto:     { label: 'Pronto',      cor: 'bg-green-100 text-green-800'  },
  entregue:   { label: 'Entregue',    cor: 'bg-zinc-100 text-zinc-500'    },
}

export default async function DetalhePedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [pedido, produtos] = await Promise.all([
    buscarPedidoPorId(id),
    listarProdutos(),
  ])

  if (!pedido) notFound()

  const produtosAtivos = produtos.filter(p => p.ativo && p.precoVenda !== null)

  const total = pedido.itens.reduce(
    (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
    0
  )

  const statusAtual = pedido.status
  const proximoStatus = STATUS_ORDEM[STATUS_ORDEM.indexOf(statusAtual) + 1] ?? null
  const cfgAtual = STATUS_CONFIG[statusAtual]

  const adicionarItem = adicionarItemPedido.bind(null, id)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pedidos" className="text-zinc-400 hover:text-zinc-700">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {pedido.cliente?.nome ?? 'Sem cliente'}
          </h1>
          <p className="text-xs text-zinc-400">
            {pedido.canal} {pedido.canalPedidoId ? `· #${pedido.canalPedidoId}` : ''}
            {pedido.prazo ? ` · prazo ${new Date(pedido.prazo).toLocaleDateString('pt-BR')}` : ''}
          </p>
        </div>
      </div>

      {/* Status atual + botão de avanço */}
      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 mb-1">Status</p>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${cfgAtual.cor}`}>
              {cfgAtual.label}
            </span>
          </div>

          {proximoStatus && (
            <form action={atualizarStatusPedido.bind(null, id, proximoStatus)}>
              <button
                type="submit"
                className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg font-medium"
              >
                Avançar → {STATUS_CONFIG[proximoStatus].label}
              </button>
            </form>
          )}
        </div>

        {/* Pagamento */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-sm text-zinc-600">Pagamento</span>
          <form action={alternarPagamento.bind(null, id, !pedido.pago)}>
            <button
              type="submit"
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                pedido.pago
                  ? 'bg-green-100 text-green-800'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {pedido.pago ? '✓ Pago' : 'Não pago'}
            </button>
          </form>
        </div>

        {/* Observações */}
        {pedido.observacoes && (
          <p className="mt-3 text-sm text-zinc-500 italic">
            {pedido.observacoes}
          </p>
        )}
      </section>

      {/* Itens do pedido */}
      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-700">Itens</h2>
          {total > 0 && (
            <span className="text-sm font-bold text-zinc-900">
              Total: R$ {total.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {pedido.itens.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum item adicionado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3 mb-4">
            {pedido.itens.map(item => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-800">
                    {item.produto.nome}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {item.quantidade}x · R$ {Number(item.precoUnitario).toFixed(2).replace('.', ',')} cada
                  </span>
                  {item.especificacoes && (
                    <span className="text-xs text-zinc-500 italic mt-0.5">
                      {item.especificacoes}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-semibold text-zinc-700">
                    R$ {(Number(item.precoUnitario) * item.quantidade).toFixed(2).replace('.', ',')}
                  </span>
                  <form action={removerItemPedido.bind(null, item.id, id)}>
                    <button type="submit" className="p-1 text-zinc-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulário de adicionar item */}
        {pedido.status !== 'entregue' && (
          <form action={adicionarItem} className="flex flex-col gap-2 pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
              Adicionar item
            </p>

            <select
              name="produtoId"
              required
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">— Selecione um produto —</option>
              {produtosAtivos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} · R$ {Number(p.precoVenda).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                name="quantidade"
                min="1"
                defaultValue="1"
                required
                className="w-24 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                name="especificacoes"
                placeholder="Personalização (opcional)"
                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-medium"
            >
              <Package size={14} />
              Adicionar item
            </button>
          </form>
        )}
      </section>

    </div>
  )
}
