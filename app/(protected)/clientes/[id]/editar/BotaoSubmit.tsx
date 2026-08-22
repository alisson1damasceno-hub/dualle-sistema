'use client'

import { useFormStatus } from 'react-dom'

export default function BotaoSubmit() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-opacity"
    >
      {pending ? 'Salvando...' : 'Salvar alterações'}
    </button>
  )
}