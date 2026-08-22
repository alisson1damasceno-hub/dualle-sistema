import Link from 'next/link'
import { listarProdutos, criarProduto, inativarProduto, reativarProduto } from './actions'
import { Pencil, ArchiveX, ArchiveRestore } from 'lucide-react'

export default async function ProdutosPage() {
  const todos = await listarProdutos()
  const ativos = todos.filter((p) => p.ativo)
  const inativos = todos.filter((p) => !p.ativo)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">Produtos</h1>

      {/* Formulário de cadastro */}
      <form action={criarProduto} className="space-y-3">
        <input
          name="nome"
          placeholder="Nome do produto (ex: Caneca Personalizada)"
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="categoria"
          placeholder="Categoria (ex: Canecas, Sandálias) — opcional"
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="margemLucro"
          type="number"
          step="1"
          min="0"
          max="100"
          placeholder="Margem de lucro (%)"
          defaultValue={60}
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium"
        >
          Cadastrar
        </button>
      </form>

      {/* Lista de ativos */}
      <div className="space-y-2">
        {ativos.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">
            Nenhum produto ativo.
          </p>
        )}
        {ativos.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200"
          >
            <div>
              <p className="font-medium text-zinc-900">{p.nome}</p>
              <p className="text-sm text-zinc-500">
                {p.categoria ?? 'Sem categoria'} · Margem: {Number(p.margemLucro)}%
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/produtos/${p.id}/editar`}
                className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
              >
                <Pencil size={18} />
              </Link>
              <form action={inativarProduto.bind(null, p.id)}>
                <button
                  type="submit"
                  title="Inativar produto"
                  className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                >
                  <ArchiveX size={18} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de inativos */}
      {inativos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Inativos ({inativos.length})
          </h2>
          <div className="space-y-2">
            {inativos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200 opacity-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">{p.nome}</p>
                  <p className="text-sm text-zinc-500">
                    {p.categoria ?? 'Sem categoria'} · Margem: {Number(p.margemLucro)}%
                  </p>
                </div>
                <form action={reativarProduto.bind(null, p.id)}>
                  <button
                    type="submit"
                    title="Reativar produto"
                    className="text-zinc-400 hover:text-green-500 transition-colors p-1"
                  >
                    <ArchiveRestore size={18} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}