import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navigation/Navbar'
import NavigationProgress from '@/components/navigation/NavigationProgress'
import { ModoProvider } from '@/context/ModoContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SRO — Sistema de Gestão Operacional',
  description: 'Gestão de água, energia, horários e atividades dos funcionários',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ModoProvider>
          <NavigationProgress />
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </ModoProvider>
      </body>
    </html>
  )
}
