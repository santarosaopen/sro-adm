'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormFuncao from '@/components/admin/FormFuncao'
import ListaFuncoes from '@/components/admin/ListaFuncoes'
import { Funcao } from '@/types'

export default function PaginaFuncoes() {
  const router = useRouter()
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [editando, setEditando] = useState<Funcao | null>(null)
  const [criando, setCriando] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const data = await fetch('/api/funcoes').then((r) => r.json())
    setFuncoes(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function toggleAtivo(f: Funcao) {
    await fetch(`/api/funcoes/${f._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !f.ativo }) })
    carregar()
  }
  async function deletar(id: string) {
    await fetch(`/api/funcoes/${id}`, { method: 'DELETE' })
    setFuncoes((prev) => prev.filter((f) => f._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Funções</h1>
      </div>
      {!criando && !editando && <Button onClick={() => setCriando(true)}>+ Nova Função</Button>}
      {(criando || editando) && (
        <Card title={editando ? 'Editar Função' : 'Nova Função'}>
          <FormFuncao funcao={editando} onSalvo={() => { setCriando(false); setEditando(null); carregar() }} onCancelar={() => { setCriando(false); setEditando(null) }} />
        </Card>
      )}
      {loading ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : (
        <Card><ListaFuncoes funcoes={funcoes} onEditar={setEditando} onDeletar={deletar} onToggleAtivo={toggleAtivo} /></Card>
      )}
    </div>
  )
}
