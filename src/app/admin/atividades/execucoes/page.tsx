'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Lightbox from '@/components/ui/Lightbox'
import Button from '@/components/ui/Button'
import { formatarDataHora, dataHoje } from '@/lib/formatters'
import { Funcao } from '@/types'

type Periodo = 'dia' | 'semana' | 'mes' | 'range'

interface ExecucaoItem {
  _id: string
  atividadeId: { _id: string; nome: string; funcaoId: { nome: string } } | string
  funcionarioId: { _id: string; nome: string } | string
  nomeExecutor?: string
  fotoExecutor?: string
  fotos: string[]
  observacao?: string
  timestamp: string
}

function periodoParaDatas(periodo: Periodo, dataInicio: string, dataFim: string): { inicio: string; fim: string } {
  if (periodo === 'range') return { inicio: dataInicio, fim: dataFim }
  const agora = new Date()
  const fim = dataHoje()
  let inicio: string
  if (periodo === 'dia') {
    inicio = fim
  } else if (periodo === 'semana') {
    const d = new Date(agora)
    d.setDate(agora.getDate() - 6)
    inicio = d.toISOString().slice(0, 10)
  } else {
    inicio = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().slice(0, 10)
  }
  return { inicio, fim }
}

export default function PaginaTodasExecucoes() {
  const router = useRouter()
  const [execucoes, setExecucoes] = useState<ExecucaoItem[]>([])
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [lightbox, setLightbox] = useState<{ fotos: string[]; idx: number } | null>(null)

  useEffect(() => {
    fetch('/api/funcoes').then((r) => r.json()).then((d) => setFuncoes(Array.isArray(d) ? d : []))
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const { inicio, fim } = periodoParaDatas(periodo, dataInicio, dataFim)
      if (!inicio || !fim) return
      const params = new URLSearchParams({ inicio, fim })
      if (filtroFuncao) params.set('funcaoId', filtroFuncao)
      const data = await fetch(`/api/execucoes/periodo?${params}`).then((r) => r.json())
      setExecucoes(Array.isArray(data) ? data : [])
    } finally {
      setCarregando(false)
    }
  }, [periodo, dataInicio, dataFim, filtroFuncao])

  useEffect(() => {
    if (periodo !== 'range' || (dataInicio && dataFim)) carregar()
  }, [carregar, periodo, dataInicio, dataFim])

  async function deletar(id: string) {
    if (!confirm('Deletar esta execução?')) return
    await fetch(`/api/execucoes/${id}`, { method: 'DELETE' })
    setExecucoes((prev) => prev.filter((e) => e._id !== id))
  }

  function nomeAtividade(e: ExecucaoItem) {
    return typeof e.atividadeId === 'object' ? e.atividadeId.nome : '—'
  }
  function nomeFuncao(e: ExecucaoItem) {
    return typeof e.atividadeId === 'object' && typeof e.atividadeId.funcaoId === 'object'
      ? e.atividadeId.funcaoId.nome : '—'
  }
  function nomeExecutor(e: ExecucaoItem) {
    return e.nomeExecutor || (typeof e.funcionarioId === 'object' ? e.funcionarioId.nome : '—')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Todas as Execuções</h1>
          <p className="text-xs text-gray-500">Histórico de atividades realizadas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-4 sm:items-end">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Período</p>
            <div className="flex gap-1">
              {(['dia', 'semana', 'mes'] as Periodo[]).map((p) => (
                <button key={p} onClick={() => { setPeriodo(p); setDataInicio(''); setDataFim('') }}
                  className={'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ' + (periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {p === 'dia' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Data início</label>
            <input type="date" value={dataInicio} max={dataHoje()}
              onChange={(e) => { setDataInicio(e.target.value); setPeriodo('range') }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Data fim</label>
            <input type="date" value={dataFim} max={dataHoje()}
              onChange={(e) => { setDataFim(e.target.value); setPeriodo('range') }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Função</label>
            <select value={filtroFuncao} onChange={(e) => setFiltroFuncao(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Todas</option>
              {funcoes.map((f) => <option key={f._id} value={f._id}>{f.nome}</option>)}
            </select>
          </div>
          <p className="self-end pb-1 text-sm text-gray-400">
            {carregando ? 'Carregando...' : `${execucoes.length} registro${execucoes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </Card>

      {!carregando && execucoes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhuma execução encontrada neste período.</p>
        </div>
      )}

      {!carregando && execucoes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Atividade</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Função</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Executor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Data/Hora</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Fotos</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {execucoes.map((ex) => (
                <tr key={ex._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {nomeAtividade(ex)}
                      {ex.observacao && (
                        <span title={ex.observacao}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {ex.observacao && <p className="mt-0.5 text-xs text-amber-700 italic truncate max-w-xs">{ex.observacao}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{nomeFuncao(ex)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ex.fotoExecutor ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ex.fotoExecutor} alt="" className="h-7 w-7 rounded-full object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                      <span className="text-gray-700 text-xs">{nomeExecutor(ex)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatarDataHora(ex.timestamp)}</td>
                  <td className="px-4 py-3 text-center">
                    {ex.fotos.length > 0 ? (
                      <button onClick={() => setLightbox({ fotos: ex.fotos, idx: 0 })}
                        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200">
                        {ex.fotos.length} foto{ex.fotos.length !== 1 ? 's' : ''}
                      </button>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="danger" onClick={() => deletar(ex._id)}>Deletar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lightbox && (
        <Lightbox fotos={lightbox.fotos} idx={lightbox.idx} onClose={() => setLightbox(null)}
          onNav={(d) => setLightbox((l) => l ? { ...l, idx: (l.idx + d + l.fotos.length) % l.fotos.length } : null)} />
      )}
    </div>
  )
}
