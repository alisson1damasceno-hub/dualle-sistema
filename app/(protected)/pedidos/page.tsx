import Link from 'next/link'
import { listarPedidos } from './actions'
import { listarClientes } from '../clientes/actions'
import { criarPedido } from './actions'
import { Plus, ChevronRight } from 'lucide-react'

// Mapa de status → label e cor visual
const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  aguardando: { label: 'Aguardando',  cor: 'bg-yellow-100 text-yellow-800' },
  producao:   { label: 'Em produção', cor: 'bg-blue-100 text-blue-800'   },
  pronto:     { label: 'Pronto',      cor: 'bg-green-100 text-green-800'  },
  entregue:   { label: 'Entregue',    cor: 'bg-zinc-100 text-zinc-500'    },
}

export default async function PedidosPage() {
  const [pedidos, clientes] = await Promise.all([
    listarPedidos(),
    listarClientes(),
  ])

  // Separa pedidos abertos (não entregues) dos encerrados
  const pedidosAbertos   = pedidos.filter(p => p.status !== 'entregue')
  const pedidosEntregues = pedidos.filter(p => p.status === 'entregue')

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Pedidos</h1>

      {/* ── Formulário de novo pedido ── */}
      <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 mb-8">
        <h2 className="font-semibold text-zinc-700 mb-4">Novo pedido</h2>
        <form action={criarPedido} className="flex flex-col gap-3">

          {/* Cliente — opcional */}
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">
              Cliente <span className="text-zinc-400">(opcional)</span>
            </label>
            <select
              name="clienteId"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">— Sem cliente (ex: Shopee) —</option>
              {clientes
                .filter(c => c.ativo)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))
              }
            </select>
          </div>

          {/* Canal */}
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">Canal</label>
            <select
              name="canal"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="direto">Direto (WhatsApp / pessoal)</option>
              <option value="instagram">Instagram</option>
              <option value="shopee">Shopee</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* ID externo — só aparece visualmente, usuário preenche se quiser */}
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">
              Nº do pedido no canal <span className="text-zinc-400">(opcional)</span>
            </label>
            <input
              type="text"
              name="canalPedidoId"
              placeholder="ex: 2048756391 (Shopee)"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Prazo */}
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">
              Prazo de entrega <span className="text-zinc-400">(opcional)</span>
            </label>
            <input
              type="date"
              name="prazo"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-sm text-zinc-600 mb-1 block">
              Observações <span className="text-zinc-400">(opcional)</span>
            </label>
            <textarea
              name="observacoes"
              rows={2}
              placeholder="ex: cliente quer embalagem especial"
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg py-2 text-sm font-medium mt-1"
          >
            <Plus size={16} />
            Criar pedido
          </button>
        </form>
      </section>

      {/* ── Lista de pedidos abertos ── */}
      <section className="mb-6">
        <h2 className="font-semibold text-zinc-700 mb-3">
          Em aberto ({pedidosAbertos.length})
        </h2>

        {pedidosAbertos.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum pedido em aberto.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pedidosAbertos.map(p => {
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.aguardando
              const total = p.itens.reduce(
                (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
                0
              )
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-900 text-sm">
                        {p.cliente?.nome ?? 'Sem cliente'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                        {total > 0 && ` · R$ ${total.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cor}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.pago ? '✓ Pago' : 'Não pago'}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-400 shrink-0" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Pedidos entregues ── */}
      {pedidosEntregues.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Entregues ({pedidosEntregues.length})
          </h2>
          <ul className="flex flex-col gap-2 opacity-60">
            {pedidosEntregues.map(p => {
              const total = p.itens.reduce(
                (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
                0
              )
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-900 text-sm">
                        {p.cliente?.nome ?? 'Sem cliente'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                        {total > 0 && ` · R$ ${total.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-500">
                        Entregue
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.pago ? '✓ Pago' : 'Não pago'}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
