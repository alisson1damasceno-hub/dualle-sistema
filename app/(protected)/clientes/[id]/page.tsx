import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Phone, AtSign, ChevronRight } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  aguardando: { label: 'Aguardando',  cor: 'bg-yellow-100 text-yellow-800' },
  producao:   { label: 'Em produção', cor: 'bg-blue-100 text-blue-800'   },
  pronto:     { label: 'Pronto',      cor: 'bg-green-100 text-green-800'  },
  entregue:   { label: 'Entregue',    cor: 'bg-zinc-100 text-zinc-500'    },
}

export default async function DetalheClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: {
        orderBy: { criadoEm: 'desc' },
        include: {
          itens: {
            include: { produto: true },
          },
        },
      },
    },
  })

  if (!cliente) notFound()

  const totalGasto = cliente.pedidos.reduce((acc, pedido) => {
    return acc + pedido.itens.reduce(
      (a, item) => a + Number(item.precoUnitario) * item.quantidade, 0
    )
  }, 0)

  const pedidosAbertos   = cliente.pedidos.filter(p => p.status !== 'entregue')
  const pedidosEntregues = cliente.pedidos.filter(p => p.status === 'entregue')

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="text-zinc-400 hover:text-zinc-700">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{cliente.nome}</h1>
          {!cliente.ativo && (
            <span className="text-xs text-red-500 font-medium">Inativo</span>
          )}
        </div>
      </div>

      {/* Informações do cliente */}
      <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-zinc-700 mb-3">Informações</h2>
        <div className="flex flex-col gap-2">
          {cliente.whatsapp && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Phone size={14} className="text-zinc-400 shrink-0" />
              {cliente.whatsapp}
            </div>
          )}
          {cliente.instagram && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <AtSign size={14} className="text-zinc-400 shrink-0" />
              {cliente.instagram}
            </div>
          )}
          {cliente.canal && (
            <div className="text-sm text-zinc-500">
              via {cliente.canal}
            </div>
          )}
        </div>
      </section>

      {/* Resumo */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{cliente.pedidos.length}</p>
          <p className="text-xs text-zinc-400 mt-1">pedidos</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{pedidosAbertos.length}</p>
          <p className="text-xs text-zinc-400 mt-1">em aberto</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 text-center">
          <p className="text-lg font-bold text-zinc-900">
            R${totalGasto.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-zinc-400 mt-1">total gasto</p>
        </div>
      </section>

      {/* Pedidos em aberto */}
      {pedidosAbertos.length > 0 && (
        <section className="mb-5">
          <h2 className="font-semibold text-zinc-700 mb-3">Em aberto</h2>
          <ul className="flex flex-col gap-2">
            {pedidosAbertos.map(p => {
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.aguardando
              const total = p.itens.reduce(
                (acc, item) => acc + Number(item.precoUnitario) * item.quantidade, 0
              )
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-800">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                        {total > 0 && ` · R$ ${total.toFixed(2).replace('.', ',')}`}
                      </span>
                      {p.prazo && (
                        <span className="text-xs text-zinc-400">
                          prazo {new Date(p.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cor}`}>
                        {cfg.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.pago ? '✓ Pago' : 'Não pago'}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-400 shrink-0 ml-2" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Histórico de entregues */}
      {pedidosEntregues.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Histórico ({pedidosEntregues.length})
          </h2>
          <ul className="flex flex-col gap-2 opacity-60">
            {pedidosEntregues.map(p => {
              const total = p.itens.reduce(
                (acc, item) => acc + Number(item.precoUnitario) * item.quantidade, 0
              )
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-800">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                        {total > 0 && ` · R$ ${total.toFixed(2).replace('.', ',')}`}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                      p.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.pago ? '✓ Pago' : 'Não pago'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {cliente.pedidos.length === 0 && (
        <p className="text-sm text-zinc-400 text-center mt-8">
          Nenhum pedido registrado ainda.
        </p>
      )}

    </div>
  )
}
