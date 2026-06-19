'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useModo } from '@/context/ModoContext'
import ModalSenhaModo from '@/components/ui/ModalSenhaModo'

const links = [
  { href: '/', label: 'Início' },
  { href: '/agua', label: 'Água' },
  { href: '/energia', label: 'Energia' },
  { href: '/ponto', label: 'Horários' },
  { href: '/atividades', label: 'Atividades' },
  { href: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { modo, entrarOperacional, sairOperacional, funcionarioLogado } = useModo()
  const [mostrarModal, setMostrarModal] = useState(false)

  function handleModoClick() {
    if (modo === 'operacional') {
      sairOperacional()
      return
    }
    setMostrarModal(true)
  }

  async function handleConfirmar(username: string, senha: string): Promise<boolean> {
    const ok = await entrarOperacional(username, senha)
    if (ok) setMostrarModal(false)
    return ok
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                S
              </div>
              <span className="text-lg font-bold text-gray-900">SRO</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleModoClick}
                title={modo === 'operacional' ? 'Sair do modo operacional' : 'Entrar no modo operacional'}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  modo === 'operacional'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {modo === 'operacional' ? 'Operacional' : 'Visualização'}
              </button>
              {modo === 'operacional' && funcionarioLogado && (
                <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:inline">
                  {funcionarioLogado.nome}
                </span>
              )}
              {modo === 'operacional' && (
                <button
                  onClick={sairOperacional}
                  title="Sair do modo operacional"
                  className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sair
                </button>
              )}
              <MobileMenu pathname={pathname} />
            </div>
          </div>
        </div>
      </nav>

      {mostrarModal && (
        <ModalSenhaModo
          onConfirmar={handleConfirmar}
          onFechar={() => setMostrarModal(false)}
        />
      )}
    </>
  )
}

function MobileMenu({ pathname }: { pathname: string }) {
  return (
    <div className="flex gap-1 md:hidden">
      {links.slice(1).map((link) => {
        const isActive = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-2 py-1 text-xs font-medium ${
              isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
