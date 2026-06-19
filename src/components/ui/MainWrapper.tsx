'use client'

import { usePathname } from 'next/navigation'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin') && pathname !== '/admin/login'
  return (
    <main className={isAdmin ? 'mx-auto max-w-7xl' : 'mx-auto max-w-7xl px-4 py-8'}>
      {children}
    </main>
  )
}
