'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Início' },
  { href: '/agua', label: 'Água' },
  { href: '/energia', label: 'Energia' },
  { href: '/ponto', label: 'Ponto' },
  { href: '/atividades', label: 'Atividades' },
  { href: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
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

          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </nav>
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
