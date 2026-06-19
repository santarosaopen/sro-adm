'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormAtividade from '@/components/admin/FormAtividade'
import ListaAtividades from '@/components/admin/ListaAtividades'
import { Atividade, Funcao } from '@/types'

export default function PaginaAtividades() {
  const router = useRouter()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [editando, setEditando] = useState<Atividade | null>(null)
  const [criando, setCriando] = useState(false)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async (funcaoId = '') => {
    setLoading(true)
    const params = funcaoId ? `?funcaoId=${funcaoId}` : ''
    const data = await fetch(`/api/atividades${params}`).then((r) => r.json())
    setAtividades(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch('/api/funcoes').then((r) => r.json()).then((d) => setFuncoes(Array.isArray(d) ? d : []))
    carregar()
  }, [carregar])

  async function toggleAtivo(a: Atividade) {
    await fetch(`/api/atividades/${a._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !a.ativo }) })
    carregar(filtroFuncao)
  }
  async function deletar(id: string) {
    await fetch(`/api/atividades/${id}`, { method: 'DELETE' })
    setAtividades((prev) => prev.filter((a) => a._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
          <h1 className="text-xl font-bold text-gray-900">Atividades</h1>
        </div>
        <button
          onClick={() => router.push('/admin/atividades/execucoes')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          Ver execuções
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Filtrar por função</label>
          <select value={filtroFuncao} onChange={(e) => { setFiltroFuncao(e.target.value); carregar(e.target.value); setCriando(false); setEditando(null) }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Todas as funções</option>
            {funcoes.map((f) => <option key={f._id} value={f._id}>{f.nome}</option>)}
          </select>
        </div>
        {!criando && !editando && filtroFuncao && (
          <div className="self-end">
            <Button onClick={() => setCriando(true)}>+ Nova Atividade</Button>
          </div>
        )}
      </div>
      {(criando || editando) && (
        <Card title={editando ? 'Editar Atividade' : 'Nova Atividade'}>
          <FormAtividade atividade={editando} funcaoIdInicial={filtroFuncao}
            onSalvo={() => { setCriando(false); setEditando(null); carregar(filtroFuncao) }}
            onCancelar={() => { setCriando(false); setEditando(null) }} />
        </Card>
      )}
      {loading ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : (
        <Card><ListaAtividades atividades={atividades} onEditar={setEditando} onDeletar={deletar} onToggleAtivo={toggleAtivo} /></Card>
      )}
    </div>
  )
}
