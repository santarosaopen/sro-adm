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
  const [drawerAberto, setDrawerAberto] = useState(false)

  function handleModoClick() {
    if (modo === 'operacional') { sairOperacional(); return }
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
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">S</div>
              <span className="text-lg font-bold text-gray-900">SRO</span>
            </Link>

            {/* Links desktop */}
            <div className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link key={link.href} href={link.href}
                    className={'rounded-lg px-3 py-2 text-sm font-medium transition-colors ' + (isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Lado direito */}
            <div className="flex items-center gap-2">
              {/* Badge modo */}
              <button onClick={handleModoClick}
                title={modo === 'operacional' ? 'Sair do modo operacional' : 'Entrar no modo operacional'}
                className={'rounded-full px-3 py-1 text-xs font-semibold transition-colors ' + (modo === 'operacional' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                {modo === 'operacional' ? 'Operacional' : 'Visualização'}
              </button>

              {/* Nome do funcionário logado (desktop) */}
              {modo === 'operacional' && funcionarioLogado && (
                <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:inline">
                  {funcionarioLogado.nome}
                </span>
              )}

              {/* Botão sair operacional */}
              {modo === 'operacional' && (
                <button onClick={sairOperacional} title="Sair do modo operacional"
                  className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span className="hidden sm:inline">Sair</span>
                </button>
              )}

              {/* Hamburger mobile */}
              <button
                onClick={() => setDrawerAberto(true)}
                className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer mobile */}
      {drawerAberto && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerAberto(false)} />
          {/* Painel lateral */}
          <div className="absolute inset-y-0 right-0 flex w-64 flex-col bg-white shadow-xl">
            {/* Cabeçalho do drawer */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <span className="font-semibold text-gray-900">Menu</span>
              <button onClick={() => setDrawerAberto(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto py-2">
              {links.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link key={link.href} href={link.href}
                    onClick={() => setDrawerAberto(false)}
                    className={'flex items-center px-4 py-3 text-sm font-medium transition-colors ' + (isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50')}>
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Rodapé: info do modo */}
            <div className="border-t border-gray-200 p-4 space-y-2">
              {modo === 'operacional' && funcionarioLogado && (
                <p className="text-xs text-gray-500">
                  Logado como <span className="font-semibold text-blue-700">{funcionarioLogado.nome}</span>
                </p>
              )}
              <button onClick={() => { handleModoClick(); setDrawerAberto(false) }}
                className={'w-full rounded-lg py-2 text-sm font-medium transition-colors ' + (modo === 'operacional' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {modo === 'operacional' ? 'Modo Operacional' : 'Modo Visualização'}
              </button>
              {modo === 'operacional' && (
                <button onClick={() => { sairOperacional(); setDrawerAberto(false) }}
                  className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                  Sair do modo operacional
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarModal && (
        <ModalSenhaModo onConfirmar={handleConfirmar} onFechar={() => setMostrarModal(false)} />
      )}
    </>
  )
}
