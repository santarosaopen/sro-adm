'use client'

import { usePathname } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) return <>{children}</>

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <AdminNav />
      <main className="flex-1 overflow-x-hidden p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
