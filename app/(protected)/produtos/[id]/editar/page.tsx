import { buscarProdutoPorId, atualizarProduto, listarItensFicha, adicionarItemFicha, removerItemFicha } from '../../actions'
import { listarMateriasPrimas } from '../../../materias-primas/actions'
import { redirect } from 'next/navigation'
import { BotaoSubmit } from './BotaoSubmit'
import { Trash2 } from 'lucide-react'

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const produto = await buscarProdutoPorId(id)

  if (!produto) redirect('/produtos')

  const [itensFicha, materiasPrimas] = await Promise.all([
    listarItensFicha(id),
    listarMateriasPrimas(),
  ])

  const materiasPrimasAtivas = materiasPrimas.filter(m => m.ativo)

  const custoTotal = itensFicha.reduce((acc, item) => {
    return acc + Number(item.quantidade) * Number(item.materiaPrima.precoUnitario)
  }, 0)

  const margem = Number(produto.margemLucro) / 100
  const precoSugerido = margem < 1 ? custoTotal / (1 - margem) : 0

  const atualizar = atualizarProduto.bind(null, id)
  const adicionar = adicionarItemFicha.bind(null, id)

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold text-zinc-900">Editar Produto</h1>

      {/* Formulário de edição */}
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
        <input
          name="precoVenda"
          type="number"
          step="0.01"
          min="0"
          defaultValue={produto.precoVenda ? Number(produto.precoVenda) : ''}
          placeholder="Preço de venda (R$)"
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <BotaoSubmit />
      </form>

      {/* Ficha Técnica */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800">Ficha Técnica</h2>

        {/* Resumo de custo */}
        <div className="bg-zinc-50 rounded-xl p-4 space-y-1 text-sm">
          <p className="text-zinc-600">
            Custo total:{' '}
            <span className="font-semibold text-zinc-900">
              R$ {custoTotal.toFixed(2).replace('.', ',')}
            </span>
          </p>
          <p className="text-zinc-600">
            Preço sugerido ({produto.margemLucro.toString()}% margem):{' '}
            <span className="font-semibold text-zinc-900">
              {itensFicha.length === 0
                ? 'Adicione itens à ficha'
                : `R$ ${precoSugerido.toFixed(2).replace('.', ',')}`}
            </span>
          </p>
          {produto.precoVenda && (
            <p className="text-zinc-600">
              Preço de venda definido:{' '}
              <span className="font-semibold text-emerald-700">
                R$ {Number(produto.precoVenda).toFixed(2).replace('.', ',')}
              </span>
            </p>
          )}
        </div>

        {/* Lista de itens */}
        {itensFicha.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum item na ficha técnica ainda.</p>
        ) : (
          <ul className="space-y-2">
            {itensFicha.map((item) => {
              const custoParcial = Number(item.quantidade) * Number(item.materiaPrima.precoUnitario)
              const remover = removerItemFicha.bind(null, item.id, id)
              return (
                <li key={item.id} className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-4 py-3">
                  <div className="text-sm">
                    <p className="font-medium text-zinc-900">{item.materiaPrima.nome}</p>
                    <p className="text-zinc-500">
                      {Number(item.quantidade)} {item.materiaPrima.unidade} × R$ {Number(item.materiaPrima.precoUnitario).toFixed(2).replace('.', ',')} = R$ {custoParcial.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <form action={remover}>
                    <button
                      type="submit"
                      title="Remover da ficha"
                      className="text-zinc-400 hover:text-red-500 transition-colors shrink-0 ml-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        )}

        {/* Formulário para adicionar item */}
        {materiasPrimasAtivas.length === 0 ? (
          <p className="text-sm text-zinc-400">Cadastre matérias-primas ativas para montar a ficha.</p>
        ) : (
          <form action={adicionar} className="flex gap-2">
            <select
              name="materiaPrimaId"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Selecione a matéria-prima</option>
              {materiasPrimasAtivas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.unidade}) — R$ {Number(m.precoUnitario).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>
            <input
              name="quantidade"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Qtd"
              required
              className="w-24 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors"
            >
              Adicionar
            </button>
          </form>
        )}
      </section>
    </div>
  )
}