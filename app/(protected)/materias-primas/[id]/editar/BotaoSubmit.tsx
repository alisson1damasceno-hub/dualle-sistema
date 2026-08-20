'use client'

import { useFormStatus } from 'react-dom'

export function BotaoSubmit() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium disabled:opacity-50 transition-opacity"
    >
      {pending ? 'Salvando...' : 'Salvar alterações'}
    </button>
  )
}