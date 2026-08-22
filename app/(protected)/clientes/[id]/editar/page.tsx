import { buscarClientePorId, atualizarCliente } from '../../actions'
import BotaoSubmit from './BotaoSubmit'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params
  const cliente = await buscarClientePorId(id)

  if (!cliente) notFound()

  const action = atualizarCliente.bind(null, id)

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Editar Cliente</h1>

      <form action={action} className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
        <input
          name="nome"
          defaultValue={cliente.nome}
          placeholder="Nome *"
          required
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="whatsapp"
          defaultValue={cliente.whatsapp ?? ''}
          placeholder="WhatsApp"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="instagram"
          defaultValue={cliente.instagram ?? ''}
          placeholder="Instagram"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <input
          name="canal"
          defaultValue={cliente.canal ?? ''}
          placeholder="Canal de origem (ex: Instagram, Indicação)"
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />

        <BotaoSubmit />
      </form>
    </div>
  )
}