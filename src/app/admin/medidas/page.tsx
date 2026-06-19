'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import TabelaLeituras from '@/components/admin/TabelaLeituras'
import { LeituraAgua, LeituraEnergia } from '@/types'

export default function PaginaMedidas() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'agua' | 'energia'>('agua')
  const [agua, setAgua] = useState<LeituraAgua[]>([])
  const [energia, setEnergia] = useState<LeituraEnergia[]>([])
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const [a, e] = await Promise.all([
      fetch('/api/agua').then((r) => r.json()),
      fetch('/api/energia').then((r) => r.json()),
    ])
    setAgua(Array.isArray(a) ? a : [])
    setEnergia(Array.isArray(e) ? e : [])
    setCarregando(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Medidas</h1>
      </div>
      <div className="flex gap-2">
        {(['agua', 'energia'] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tipo === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'agua' ? 'Água' : 'Energia'}
          </button>
        ))}
      </div>
      {carregando ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : tipo === 'agua' ? (
        <Card title={`Leituras de Água (${agua.length})`}><TabelaLeituras leituras={agua} unidade="m³" apiPath="agua" onAtualizado={carregar} /></Card>
      ) : (
        <Card title={`Leituras de Energia (${energia.length})`}><TabelaLeituras leituras={energia} unidade="kWh" apiPath="energia" onAtualizado={carregar} /></Card>
      )}
    </div>
  )
}
