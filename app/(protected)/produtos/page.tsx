import Link from 'next/link'
import { listarProdutos, criarProduto, deletarProduto } from './actions'
import { Trash2, Pencil } from 'lucide-react'

export default async function ProdutosPage() {
  const produtos = await listarProdutos()

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
        <div className="flex gap-2 items-center">
          <input
            name="margemLucro"
            type="number"
            step="1"
            min="0"
            max="100"
            placeholder="Margem de lucro (%)"
            defaultValue={60}
            required
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium"
        >
          Cadastrar
        </button>
      </form>

      {/* Lista */}
      <div className="space-y-2">
        {produtos.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">
            Nenhum produto cadastrado ainda.
          </p>
        )}
        {produtos.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200"
          >
            <div>
              <p className="font-medium text-zinc-900">{p.nome}</p>
              <p className="text-sm text-zinc-500">
                {p.categoria ?? 'Sem categoria'} · Margem: {Number(p.margemLucro)}%
                {!p.ativo && <span className="ml-2 text-red-400">inativo</span>}
              </p>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/produtos/${p.id}/editar`}
                className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
              >
                <Pencil size={18} />
              </Link>
              <form action={deletarProduto.bind(null, p.id)}>
                <button
                  type="submit"
                  className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}