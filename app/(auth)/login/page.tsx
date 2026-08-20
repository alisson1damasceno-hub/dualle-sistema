'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Dualle Personalizados</h1>
          <p className="text-sm text-zinc-500 mt-1">Sistema de gestão</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900"
          />

          {erro && <p className="text-sm text-red-500">{erro}</p>}

          <button
            onClick={handleLogin}
            disabled={carregando}
            className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}