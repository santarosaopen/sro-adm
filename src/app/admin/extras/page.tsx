'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Lightbox from '@/components/ui/Lightbox'
import Button from '@/components/ui/Button'
import { formatarDataHora, dataHoje } from '@/lib/formatters'
import { AtividadeExtra, Funcionario } from '@/types'

type Periodo = 'dia' | 'semana' | 'mes' | 'range'

export default function PaginaAdminExtras() {
  const router = useRouter()
  const [extras, setExtras] = useState<AtividadeExtra[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [carregando, setCarregando] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const [funcionarioId, setFuncionarioId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [aberto, setAberto] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ fotos: string[]; idx: number } | null>(null)

  useEffect(() => {
    fetch('/api/funcionarios').then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : []))
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setAberto(null)
    try {
      const params = new URLSearchParams()
      if (funcionarioId) params.set('funcionarioId', funcionarioId)
      if (periodo === 'range' && dataInicio && dataFim) {
        params.set('inicio', dataInicio)
        params.set('fim', dataFim)
      } else {
        params.set('periodo', periodo)
      }
      const res = await fetch(`/api/extras?${params}`).then((r) => r.json())
      setExtras(Array.isArray(res) ? res : [])
    } finally { setCarregando(false) }
  }, [periodo, funcionarioId, dataInicio, dataFim])

  useEffect(() => { carregar() }, [carregar])

  function nomeFuncionario(ex: AtividadeExtra) {
    return ex.funcionarioId && typeof ex.funcionarioId === 'object' ? ex.funcionarioId.nome : '—'
  }

  async function deletar(id: string) {
    if (!confirm('Deletar esta atividade extra? A ação não pode ser desfeita.')) return
    await fetch(`/api/extras/${id}`, { method: 'DELETE' })
    setExtras((prev) => prev.filter((e) => e._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Atividades Extras</h1>
          <p className="mt-0.5 text-sm text-gray-500">Registros de atividades não previstas</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 sm:items-end">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Período</p>
            <div className="flex gap-1">
              {(['dia', 'semana', 'mes'] as Periodo[]).map((p) => (
                <button key={p} onClick={() => { setPeriodo(p); setDataInicio(''); setDataFim('') }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {p === 'dia' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Data início</label>
            <input type="date" value={dataInicio} max={dataHoje()} onChange={(e) => { setDataInicio(e.target.value); setPeriodo('range') }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Data fim</label>
            <input type="date" value={dataFim} max={dataHoje()} onChange={(e) => { setDataFim(e.target.value); setPeriodo('range') }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Funcionário</label>
            <select value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Todos</option>
              {funcionarios.map((f) => <option key={f._id} value={f._id}>{f.nome}</option>)}
            </select>
          </div>
          <p className="self-end pb-1 text-sm text-gray-400">
            {carregando ? 'Carregando...' : `${extras.length} registro${extras.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </Card>

      {!carregando && extras.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhuma atividade extra registrada neste período.</p>
        </div>
      )}

      {!carregando && extras.map((ex) => {
        const isAberto = aberto === ex._id
        const temObs = !!ex.observacao
        return (
          <div key={ex._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setAberto(isAberto ? null : ex._id!)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{ex.descricao}</p>
                  {temObs && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500" title={ex.observacao}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{nomeFuncionario(ex)} · {formatarDataHora(ex.timestamp)}</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  {ex.fotos.length} foto{ex.fotos.length !== 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => { e.stopPropagation(); deletar(ex._id!) }}
                >
                  Deletar
                </Button>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-gray-400 transition-transform ${isAberto ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isAberto && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.descricao}</p>
                {temObs && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                    <p className="text-xs font-medium text-amber-700 mb-0.5">Observação</p>
                    <p className="text-sm text-amber-800 italic">{ex.observacao}</p>
                  </div>
                )}
                {ex.fotos.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {ex.fotos.map((f, i) => (
                      <button key={i} onClick={() => setLightbox({ fotos: ex.fotos, idx: i })}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f} alt={`foto ${i + 1}`} className="h-24 w-24 rounded-xl border border-gray-200 object-cover transition-opacity hover:opacity-80" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {lightbox && (
        <Lightbox
          fotos={lightbox.fotos}
          idx={lightbox.idx}
          onClose={() => setLightbox(null)}
          onNav={(d) => setLightbox((l) => l ? { ...l, idx: (l.idx + d + l.fotos.length) % l.fotos.length } : null)}
        />
      )}
    </div>
  )
}
