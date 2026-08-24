import Link from 'next/link'
import { listarMateriasPrimas, criarMateriaPrima, inativarMateriaPrima, reativarMateriaPrima } from './actions'
import { Pencil, ArchiveX, ArchiveRestore } from 'lucide-react'
import type { MateriaPrimaModel as MateriaPrima } from '../../generated/prisma/models/MateriaPrima'

export default async function MateriasPrimasPage() {
  const todas = await listarMateriasPrimas()
  const ativas = todas.filter((m: MateriaPrima) => m.ativo)
  const inativas = todas.filter((m: MateriaPrima) => !m.ativo)

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
        <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Lista de ativas */}
      <div className="space-y-2">
        {ativas.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">
            Nenhuma matéria-prima ativa.
          </p>
        )}
        {ativas.map((m: MateriaPrima) => (
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
            <div className="flex gap-1">
              <Link
                href={`/materias-primas/${m.id}/editar`}
                className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
              >
                <Pencil size={18} />
              </Link>
              <form action={inativarMateriaPrima.bind(null, m.id)}>
                <button
                  type="submit"
                  title="Inativar matéria-prima"
                  className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                >
                  <ArchiveX size={18} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de inativas */}
      {inativas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Inativas ({inativas.length})
          </h2>
          <div className="space-y-2">
            {inativas.map((m: MateriaPrima) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200 opacity-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">{m.nome}</p>
                  <p className="text-sm text-zinc-500">
                    {m.unidade} · R$ {Number(m.precoUnitario).toFixed(2)}
                  </p>
                </div>
                <form action={reativarMateriaPrima.bind(null, m.id)}>
                  <button
                    type="submit"
                    title="Reativar matéria-prima"
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