'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Lightbox from '@/components/ui/Lightbox'
import { dataHoje, formatarHora } from '@/lib/formatters'
import { useModo } from '@/context/ModoContext'
import { Funcao } from '@/types'

interface ItemDia {
  _id: string
  nome: string
  funcionario: string
  funcaoId: string | null
  funcaoNome: string | null
  fotos: string[]
  observacao?: string
  timestamp: string
  tipo: 'qr' | 'extra'
}

interface Sugestao {
  _id: string
  nome: string
  qrToken: string
  periodicidade: string
  ultimaExecucao: string | null
}

const PALETA: [string, string][] = [
  ['bg-blue-100',   'text-blue-700'],
  ['bg-green-100',  'text-green-700'],
  ['bg-amber-100',  'text-amber-700'],
  ['bg-rose-100',   'text-rose-700'],
  ['bg-violet-100', 'text-violet-700'],
  ['bg-cyan-100',   'text-cyan-700'],
  ['bg-orange-100', 'text-orange-700'],
  ['bg-teal-100',   'text-teal-700'],
  ['bg-pink-100',   'text-pink-700'],
  ['bg-indigo-100', 'text-indigo-700'],
]

function useCoresFuncao(itens: ItemDia[]) {
  return useMemo(() => {
    const mapa: Record<string, [string, string]> = {}
    let idx = 0
    for (const item of itens) {
      if (item.funcaoId && !mapa[item.funcaoId]) {
        mapa[item.funcaoId] = PALETA[idx % PALETA.length]
        idx++
      }
    }
    return mapa
  }, [itens])
}

export default function PaginaAtividades() {
  const { modo, funcionarioLogado } = useModo()
  const router = useRouter()

  // Modo visualização
  const [data, setData] = useState(dataHoje())
  const [funcaoId, setFuncaoId] = useState('')
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [itens, setItens] = useState<ItemDia[]>([])
  const [carregando, setCarregando] = useState(false)
  const [lightbox, setLightbox] = useState<{ fotos: string[]; idx: number } | null>(null)

  // Modo operacional
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [execucoesHoje, setExecucoesHoje] = useState<ItemDia[]>([])
  const [carregandoExec, setCarregandoExec] = useState(false)

  const coresFuncao = useCoresFuncao(itens)

  const carregar = useCallback(async (d: string, fid: string) => {
    setCarregando(true)
    try {
      const params = new URLSearchParams({ data: d })
      if (fid) params.set('funcaoId', fid)
      const res = await fetch(`/api/atividades/dia?${params}`).then((r) => r.json())
      setItens(Array.isArray(res) ? res : [])
    } finally {
      setCarregando(false)
    }
  }, [])

  // Carrega sugestões para o funcionário logado, baseando-se na presença de hoje
  const carregarSugestoes = useCallback(async () => {
    if (!funcionarioLogado) { setSugestoes([]); return }
    try {
      // Busca a presença de hoje para saber a função atual do funcionário
      const presenca = await fetch('/api/ponto/presenca').then((r) => r.json())
      const minha = Array.isArray(presenca)
        ? presenca.find((p: { funcionario: { _id: string }; funcao: { _id: string } }) =>
            p.funcionario._id === funcionarioLogado.id
          )
        : null
      if (!minha) { setSugestoes([]); return }

      const params = new URLSearchParams({
        funcaoId: minha.funcao._id,
        funcionarioId: funcionarioLogado.id,
      })
      const res = await fetch(`/api/atividades/sugestoes?${params}`).then((r) => r.json())
      setSugestoes(Array.isArray(res) ? res : [])
    } catch {
      setSugestoes([])
    }
  }, [funcionarioLogado])

  useEffect(() => {
    if (modo === 'visualizacao') {
      fetch('/api/funcoes').then((r) => r.json()).then((d) => setFuncoes(Array.isArray(d) ? d : []))
    }
  }, [modo])

  useEffect(() => {
    if (modo === 'visualizacao') carregar(data, funcaoId)
  }, [modo, data, funcaoId, carregar])

  const carregarExecucoesHoje = useCallback(async () => {
    if (!funcionarioLogado) { setExecucoesHoje([]); return }
    setCarregandoExec(true)
    try {
      const hoje = dataHoje()
      const [resQR, resExtras] = await Promise.all([
        fetch(`/api/execucoes/periodo?inicio=${hoje}&fim=${hoje}&funcionarioId=${funcionarioLogado.id}`).then((r) => r.json()),
        fetch(`/api/extras?periodo=dia&funcionarioId=${funcionarioLogado.id}`).then((r) => r.json()),
      ])

      const qrItems: ItemDia[] = Array.isArray(resQR) ? resQR.map((e: {
        _id: string
        atividadeId: { _id: string; nome: string; funcaoId: { _id: string; nome: string } } | string
        funcionarioId: { _id: string; nome: string } | string
        fotos: string[]
        observacao?: string
        timestamp: string
      }) => {
        const ativ = typeof e.atividadeId === 'object' ? e.atividadeId : null
        const funcao = ativ && typeof ativ.funcaoId === 'object' ? ativ.funcaoId : null
        return {
          _id: e._id,
          nome: ativ?.nome ?? '—',
          funcionario: e.funcionarioId && typeof e.funcionarioId === 'object' ? e.funcionarioId.nome : '—',
          funcaoId: funcao ? String(funcao._id) : null,
          funcaoNome: funcao?.nome ?? null,
          fotos: e.fotos,
          observacao: e.observacao,
          timestamp: e.timestamp,
          tipo: 'qr' as const,
        }
      }) : []

      const extraItems: ItemDia[] = Array.isArray(resExtras) ? resExtras.map((e: {
        _id: string
        funcionarioId: { _id: string; nome: string } | string
        descricao: string
        fotos: string[]
        observacao?: string
        timestamp: string
      }) => ({
        _id: e._id,
        nome: e.descricao,
        funcionario: e.funcionarioId && typeof e.funcionarioId === 'object' ? e.funcionarioId.nome : '—',
        funcaoId: null,
        funcaoNome: null,
        fotos: e.fotos,
        observacao: e.observacao,
        timestamp: e.timestamp,
        tipo: 'extra' as const,
      })) : []

      const lista = [...qrItems, ...extraItems].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setExecucoesHoje(lista)
    } catch {
      setExecucoesHoje([])
    } finally {
      setCarregandoExec(false)
    }
  }, [funcionarioLogado])

  useEffect(() => {
    if (modo === 'operacional') {
      carregarSugestoes()
      carregarExecucoesHoje()
    }
  }, [modo, carregarSugestoes, carregarExecucoesHoje])

  // ── Modo operacional ─────────────────────────────────────────────────────────

  if (modo === 'operacional') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          {funcionarioLogado && (
            <p className="mt-1 text-sm text-gray-500">
              Logado como <span className="font-medium">{funcionarioLogado.nome}</span>
            </p>
          )}
        </div>

        {/* Sugestões de periodicidade */}
        {sugestoes.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-semibold text-amber-800">
                {sugestoes.length} atividade{sugestoes.length !== 1 ? 's' : ''} pendente{sugestoes.length !== 1 ? 's' : ''} hoje
              </p>
            </div>
            <div className="space-y-2">
              {sugestoes.map((s) => (
                <div
                  key={s._id}
                  className="rounded-lg border border-amber-200 bg-white px-3 py-2.5"
                >
                  <p className="truncate text-sm font-medium text-gray-900">{s.nome}</p>
                  <p className="text-xs text-amber-600">{s.periodicidade}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escanear QR */}
        <button
          onClick={() => router.push('/atividades/escanear')}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 py-14 text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M17 14h3M14 17v3" />
          </svg>
          <span className="text-lg font-semibold">Escanear QR Code</span>
          <span className="text-sm text-blue-400">Aponte a câmera para o QR Code da atividade</span>
        </button>

        {/* Atividade extra */}
        <button
          onClick={() => router.push('/atividades/extras/registrar')}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 py-8 text-purple-600 transition-colors hover:border-purple-400 hover:bg-purple-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-base font-semibold">Registrar Atividade Extra</span>
        </button>

        {/* Atividades executadas hoje pelo funcionário logado */}
        {funcionarioLogado && (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Executadas hoje
              {execucoesHoje.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {execucoesHoje.length}
                </span>
              )}
            </p>
            {carregandoExec ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : execucoesHoje.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma atividade registrada ainda hoje.</p>
            ) : (
              <div className="space-y-3">
                {execucoesHoje.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-gray-900">{item.nome}</p>
                          {item.observacao && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
                              <title>{item.observacao}</title>
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          )}
                        </div>
                        {item.funcaoNome && (
                          <p className="text-xs text-gray-400">{item.funcaoNome} · {formatarHora(item.timestamp)}</p>
                        )}
                        {item.observacao && (
                          <p className="mt-0.5 text-xs italic text-amber-700">"{item.observacao}"</p>
                        )}
                      </div>
                      <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </div>
                    {item.fotos.length > 0 && (
                      <div className="flex gap-2 border-t border-gray-100 px-4 py-2.5">
                        {item.fotos.map((f, i) => (
                          <button key={i} onClick={() => setLightbox({ fotos: item.fotos, idx: i })}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f} alt={'foto ' + (i + 1)} className="h-14 w-14 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Modo visualização ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Atividades do Dia</h1>
        <p className="mt-1 text-sm text-gray-500">Registros de QR e atividades extras</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 sm:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dia</label>
            <input
              type="date"
              value={data}
              max={dataHoje()}
              onChange={(e) => setData(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Função</label>
            <select
              value={funcaoId}
              onChange={(e) => setFuncaoId(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {funcoes.map((f) => <option key={f._id} value={f._id}>{f.nome}</option>)}
            </select>
          </div>
          <p className="self-end pb-2 text-sm text-gray-400">
            {carregando ? 'Carregando...' : `${itens.length} registro${itens.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </Card>

      {!carregando && itens.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhuma atividade registrada para este dia.</p>
        </div>
      )}

      {!carregando && itens.length > 0 && (
        <div className="space-y-3">
          {itens.map((item) => {
            const cor = item.funcaoId ? coresFuncao[item.funcaoId] : null
            return (
              <div key={item._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{item.nome}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500">{item.funcionario} · {formatarHora(item.timestamp)}</span>
                      {item.funcaoNome && cor && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cor[0]} ${cor[1]}`}>
                          {item.funcaoNome}
                        </span>
                      )}
                      {item.tipo === 'extra' && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          extra
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-gray-400">
                    {item.fotos.length} foto{item.fotos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {item.fotos.length > 0 && (
                  <div className="flex gap-2 border-t border-gray-100 px-4 py-3">
                    {item.fotos.map((f, i) => (
                      <button key={i} onClick={() => setLightbox({ fotos: item.fotos, idx: i })}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f} alt={`foto ${i + 1}`} className="h-16 w-16 rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
