import Link from 'next/link'
import { Home, Package, ShoppingBag, Users } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/materias-primas', label: 'Materiais', icon: Package },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/clientes', label: 'Clientes', icon: Users },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Conteúdo principal — pb-20 evita que o conteúdo fique atrás da nav */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Navegação inferior fixa */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}