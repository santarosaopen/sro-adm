'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import TabelaPontos from '@/components/admin/TabelaPontos'
import { Funcionario, RegistroPonto } from '@/types'

type Periodo = 'semana' | 'mes' | 'ano' | 'range'

function filtrar(registros: RegistroPonto[], periodo: Periodo, inicio: string, fim: string) {
  if (periodo === 'range') {
    return registros.filter((r) => {
      const ts = new Date(r.timestamp)
      if (inicio && ts < new Date(inicio + 'T00:00:00')) return false
      if (fim && ts > new Date(fim + 'T23:59:59')) return false
      return true
    })
  }
  const agora = new Date()
  let d: Date
  if (periodo === 'semana') { d = new Date(agora); d.setDate(agora.getDate() - 6); d.setHours(0, 0, 0, 0) }
  else if (periodo === 'mes') { d = new Date(agora.getFullYear(), agora.getMonth(), 1) }
  else { d = new Date(agora.getFullYear(), 0, 1) }
  return registros.filter((r) => new Date(r.timestamp) >= d)
}

export default function PaginaPontos() {
  const router = useRouter()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionarioId, setFuncionarioId] = useState('')
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    fetch('/api/funcionarios').then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : []))
  }, [])

  const carregarPontos = useCallback(async (id: string) => {
    if (!id) { setRegistros([]); return }
    setCarregando(true)
    const data = await fetch(`/api/ponto?funcionarioId=${id}`).then((r) => r.json())
    setRegistros(Array.isArray(data) ? data : [])
    setCarregando(false)
  }, [])

  useEffect(() => { carregarPontos(funcionarioId) }, [funcionarioId, carregarPontos])

  async function deletar(id: string) {
    await fetch(`/api/ponto/${id}`, { method: 'DELETE' })
    setRegistros((prev) => prev.filter((r) => r._id !== id))
  }

  const filtrados = filtrar(registros, periodo, dataInicio, dataFim)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Registros de Presença</h1>
      </div>
      <Card title="Filtros">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Funcionário</label>
            <select value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Selecione...</option>
              {funcionarios.map((f) => <option key={f._id} value={f._id!}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Período</p>
            <div className="flex flex-wrap gap-1">
              {(['semana', 'mes', 'ano'] as Periodo[]).map((p) => (
                <button key={p} onClick={() => { setPeriodo(p); setDataInicio(''); setDataFim('') }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Início</label>
            <input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setPeriodo('range') }} className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fim</label>
            <input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setPeriodo('range') }} className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </Card>
      {!funcionarioId ? (
        <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">Selecione um funcionário.</p>
      ) : carregando ? (
        <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>
      ) : (
        <Card title={`${filtrados.length} registro${filtrados.length !== 1 ? 's' : ''}`}>
          <TabelaPontos registros={filtrados} onDeletar={deletar} />
        </Card>
      )}
    </div>
  )
}
