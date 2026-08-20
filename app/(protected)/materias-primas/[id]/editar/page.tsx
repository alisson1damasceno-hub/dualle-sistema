import { buscarMateriaPrimaPorId, atualizarMateriaPrima } from '../../actions'
import { redirect } from 'next/navigation'

export default async function EditarMateriaPrimaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const materia = await buscarMateriaPrimaPorId(id)

  if (!materia) {
    redirect('/materias-primas')
  }

  const atualizar = atualizarMateriaPrima.bind(null, id)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">Editar Matéria-Prima</h1>

      <form action={atualizar} className="space-y-3">
        <input
          name="nome"
          defaultValue={materia.nome}
          placeholder="Nome"
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <div className="flex gap-2">
          <input
            name="unidade"
            defaultValue={materia.unidade}
            placeholder="Unidade"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <input
            name="precoUnitario"
            type="number"
            step="0.01"
            min="0"
            defaultValue={Number(materia.precoUnitario)}
            placeholder="Preço (R$)"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  )
}