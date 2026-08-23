import { listarClientes, criarCliente, inativarCliente, reativarCliente } from './actions'
import { Pencil, ArchiveX, ArchiveRestore } from 'lucide-react'
import Link from 'next/link'

export default async function ClientesPage() {
  const todos = await listarClientes()
  const ativos = todos.filter((c) => c.ativo)
  const inativos = todos.filter((c) => !c.ativo)

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>

      {/* Formulário de cadastro */}
      <form action={criarCliente} className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Novo Cliente</h2>
        <input
          name="nome"
          placeholder="Nome *"
          required
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="whatsapp"
          placeholder="WhatsApp"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="instagram"
          placeholder="Instagram"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="canal"
          placeholder="Canal de origem (ex: Instagram, Indicação)"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          Cadastrar
        </button>
      </form>

      {/* Lista de clientes ativos */}
      <div className="flex flex-col gap-3 mb-8">
        {ativos.length === 0 && (
          <p className="text-zinc-400 text-sm text-center py-8">
            Nenhum cliente ativo.
          </p>
        )}
        {ativos.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-2"
          >
            <div className="flex flex-col gap-1">
              <Link
                href={`/clientes/${cliente.id}`}
                className="font-medium hover:text-blue-600 transition-colors"
              >
                {cliente.nome}
              </Link>
              {cliente.whatsapp && (
                <span className="text-sm text-zinc-500">📱 {cliente.whatsapp}</span>
              )}
              {cliente.instagram && (
                <span className="text-sm text-zinc-500">📷 {cliente.instagram}</span>
              )}
              {cliente.canal && (
                <span className="text-xs text-zinc-400">via {cliente.canal}</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/clientes/${cliente.id}/editar`}>
                <Pencil size={18} className="text-zinc-400 hover:text-blue-500 transition-colors" />
              </Link>
              <form action={inativarCliente.bind(null, cliente.id)}>
                <button type="submit" title="Inativar cliente">
                  <ArchiveX size={18} className="text-zinc-400 hover:text-red-500 transition-colors" />
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
          <div className="flex flex-col gap-3">
            {inativos.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-2 opacity-50"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{cliente.nome}</span>
                  {cliente.whatsapp && (
                    <span className="text-sm text-zinc-500">📱 {cliente.whatsapp}</span>
                  )}
                  {cliente.instagram && (
                    <span className="text-sm text-zinc-500">📷 {cliente.instagram}</span>
                  )}
                  {cliente.canal && (
                    <span className="text-xs text-zinc-400">via {cliente.canal}</span>
                  )}
                </div>
                <form action={reativarCliente.bind(null, cliente.id)}>
                  <button type="submit" title="Reativar cliente">
                    <ArchiveRestore size={18} className="text-zinc-400 hover:text-green-500 transition-colors" />
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
