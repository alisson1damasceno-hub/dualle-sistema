import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const [pedidos, produtos] = await Promise.all([
    prisma.pedido.findMany({
      include: {
        itens: true,
        cliente: true,
      },
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.produto.findMany({
      where: { ativo: true },
    }),
  ])

  // Pedidos por status
  const emAberto     = pedidos.filter(p => p.status !== 'entregue')
  const aguardando   = pedidos.filter(p => p.status === 'aguardando')
  const emProducao   = pedidos.filter(p => p.status === 'producao')
  const prontos      = pedidos.filter(p => p.status === 'pronto')

  // Financeiro
  const totalEmAberto = emAberto.reduce((acc, p) =>
    acc + p.itens.reduce((a, i) => a + Number(i.precoUnitario) * i.quantidade, 0), 0
  )
  const naoRecebido = emAberto
    .filter(p => !p.pago)
    .reduce((acc, p) =>
      acc + p.itens.reduce((a, i) => a + Number(i.precoUnitario) * i.quantidade, 0), 0
    )

  // Pedidos com prazo vencido (prazo < hoje e não entregue)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const atrasados = emAberto.filter(p => p.prazo && new Date(p.prazo) < hoje)

  // Produtos sem preço de venda
  const semPreco = produtos.filter(p => !p.precoVenda)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Início</h1>
      <p className="text-sm text-zinc-400 mb-6">
        {new Date().toLocaleDateString('pt-BR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </p>

      {/* ── Alertas ── */}
      {(atrasados.length > 0 || semPreco.length > 0) && (
        <section className="flex flex-col gap-2 mb-6">
          {atrasados.length > 0 && (
            <Link href="/pedidos">
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {atrasados.length} {atrasados.length === 1 ? 'pedido atrasado' : 'pedidos atrasados'}
                </p>
              </div>
            </Link>
          )}
          {semPreco.length > 0 && (
            <Link href="/produtos">
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
                <AlertCircle size={18} className="text-yellow-500 shrink-0" />
                <p className="text-sm text-yellow-700 font-medium">
                  {semPreco.length} {semPreco.length === 1 ? 'produto sem preço de venda' : 'produtos sem preço de venda'}
                </p>
              </div>
            </Link>
          )}
        </section>
      )}

      {/* ── Cards de status ── */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-500" />
            <span className="text-xs text-zinc-400">Aguardando</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{aguardando.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={16} className="text-blue-500" />
            <span className="text-xs text-zinc-400">Em produção</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{emProducao.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs text-zinc-400">Prontos</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{prontos.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={16} className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Total em aberto</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{emAberto.length}</p>
        </div>
      </section>

      {/* ── Financeiro ── */}
      <section className="flex flex-col gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs text-zinc-400 mb-1">Em aberto (valor total)</p>
          <p className="text-2xl font-bold text-zinc-900">
            R$ {totalEmAberto.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
          <p className="text-xs text-zinc-400 mb-1">Ainda não recebido</p>
          <p className="text-2xl font-bold text-red-600">
            R$ {naoRecebido.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </section>

      {/* ── Pedidos recentes ── */}
      {emAberto.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-zinc-700">Pedidos em aberto</h2>
            <Link href="/pedidos" className="text-xs text-blue-500">
              Ver todos
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {emAberto.slice(0, 5).map(p => {
              const total = p.itens.reduce(
                (acc, i) => acc + Number(i.precoUnitario) * i.quantidade, 0
              )
              const atrasado = p.prazo && new Date(p.prazo) < hoje
              return (
                <li key={p.id}>
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-zinc-800">
                        {p.cliente?.nome ?? 'Sem cliente'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                        {total > 0 && ` · R$ ${total.toFixed(2).replace('.', ',')}`}
                      </span>
                      {atrasado && (
                        <span className="text-xs text-red-500 font-medium">
                          ⚠ prazo vencido
                        </span>
                      )}
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

      {emAberto.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">Tudo em dia!</p>
          <p className="text-sm text-zinc-400">Nenhum pedido em aberto.</p>
        </div>
      )}

    </div>
  )
}
