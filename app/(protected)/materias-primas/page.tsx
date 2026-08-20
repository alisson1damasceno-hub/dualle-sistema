import { listarMateriasPrimas, criarMateriaPrima, deletarMateriaPrima } from './actions'
import { Trash2 } from 'lucide-react'
import type { MateriaPrimaModel as MateriaPrima } from '../../generated/prisma/models/MateriaPrima'

export default async function MateriasPrimasPage() {
  const materias = await listarMateriasPrimas()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">Matérias-Primas</h1>

      {/* Formulário de cadastro */}
      <form action={criarMateriaPrima} className="space-y-3">
        <input
          name="nome"
          placeholder="Nome (ex: Caneca 325ml)"
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <div className="flex gap-2">
          <input
            name="unidade"
            placeholder="Unidade (ex: un, m, kg)"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <input
            name="precoUnitario"
            type="number"
            step="0.01"
            min="0"
            placeholder="Preço (R$)"
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
        {materias.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">
            Nenhuma matéria-prima cadastrada ainda.
          </p>
        )}
        {materias.map((m: MateriaPrima) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200"
          >
            <div>
              <p className="font-medium text-zinc-900">{m.nome}</p>
              <p className="text-sm text-zinc-500">
                {m.unidade} · R$ {Number(m.precoUnitario).toFixed(2)}
              </p>
            </div>
            <form action={deletarMateriaPrima.bind(null, m.id)}>
              <button
                type="submit"
                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={18} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}