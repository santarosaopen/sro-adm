'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TabelaLogs from '@/components/admin/TabelaLogs'

interface LogEntry { _id: string; adminUsername: string; acao: string; descricao: string; createdAt: string }

export default function PaginaLogs() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/logs').then((r) => r.json())
    setLogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
          <h1 className="text-xl font-bold text-gray-900">Logs do Sistema</h1>
        </div>
        <Button variant="secondary" onClick={carregar}>Atualizar</Button>
      </div>
      <p className="text-sm text-gray-500">Últimas 200 entradas de auditoria.</p>
      {loading ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : <Card><TabelaLogs logs={logs} /></Card>}
    </div>
  )
}
