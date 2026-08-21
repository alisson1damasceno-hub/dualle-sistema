import { buscarProdutoPorId, atualizarProduto } from '../../actions'
import { redirect } from 'next/navigation'
import { BotaoSubmit } from './BotaoSubmit'

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const produto = await buscarProdutoPorId(id)

  if (!produto) {
    redirect('/produtos')
  }

  const atualizar = atualizarProduto.bind(null, id)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">Editar Produto</h1>

      <form action={atualizar} className="space-y-3">
        <input
          name="nome"
          defaultValue={produto.nome}
          placeholder="Nome do produto"
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="categoria"
          defaultValue={produto.categoria ?? ''}
          placeholder="Categoria — opcional"
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="descricao"
          defaultValue={produto.descricao ?? ''}
          placeholder="Descrição — opcional"
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          name="margemLucro"
          type="number"
          step="1"
          min="0"
          max="100"
          defaultValue={Number(produto.margemLucro)}
          placeholder="Margem de lucro (%)"
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <BotaoSubmit />
      </form>
    </div>
  )
}