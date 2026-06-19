'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatarDataHora } from '@/lib/formatters'
import { ExecucaoAtividade } from '@/types'
import Button from '@/components/ui/Button'

interface AtividadeInfo { _id: string; nome: string; funcaoId: { nome: string } }

export default function PaginaExecucoes() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [atividade, setAtividade] = useState<AtividadeInfo | null>(null)
  const [execucoes, setExecucoes] = useState<ExecucaoAtividade[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ fotos: string[]; idx: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/atividades/${id}`).then((r) => r.json()),
      fetch(`/api/execucoes?atividadeId=${id}`).then((r) => r.json()),
    ]).then(([ativ, execs]) => {
      setAtividade(ativ)
      setExecucoes(Array.isArray(execs) ? execs : [])
    }).finally(() => setLoading(false))
  }, [id])

  function abrirLightbox(fotos: string[], idx: number) {
    setLightbox({ fotos, idx })
  }

  async function deletarExecucao(execucaoId: string) {
    if (!confirm('Deletar esta execução? A ação não pode ser desfeita.')) return
    await fetch(`/api/execucoes/${execucaoId}`, { method: 'DELETE' })
    setExecucoes((prev) => prev.filter((e) => e._id !== execucaoId))
  }

  function navLightbox(delta: number) {
    if (!lightbox) return
    const novo = (lightbox.idx + delta + lightbox.fotos.length) % lightbox.fotos.length
    setLightbox({ ...lightbox, idx: novo })
  }

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') navLightbox(1)
      else if (e.key === 'ArrowLeft') navLightbox(-1)
      else if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (loading) return <div className="py-20 text-center text-sm text-gray-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{atividade?.nome ?? 'Execuções'}</h1>
          <p className="text-xs text-gray-500">{atividade?.funcaoId?.nome} · {execucoes.length} execução{execucoes.length !== 1 ? 'ões' : ''}</p>
        </div>
      </div>

      {execucoes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhuma execução registrada para esta atividade.</p>
        </div>
      )}

      <div className="space-y-3">
        {execucoes.map((ex) => {
          const nomeExibido = ex.nomeExecutor || (ex.funcionarioId && typeof ex.funcionarioId === 'object' ? ex.funcionarioId.nome : null) || '—'
          const fotos = ex.fotos
          return (
            <div key={ex._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Foto do executor (da presença) */}
                <div className="shrink-0">
                  {ex.fotoExecutor ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ex.fotoExecutor} alt={nomeExibido} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{nomeExibido}</p>
                    {ex.observacao && (
                      <span title={ex.observacao}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{formatarDataHora(ex.timestamp)}</p>
                  {ex.observacao && (
                    <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 italic">{ex.observacao}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => deletarExecucao(ex._id!)}>
                    Deletar
                  </Button>
                </div>
              </div>
              {fotos.length > 0 && (
                <div className="flex gap-2 border-t border-gray-100 px-4 py-3">
                  {fotos.map((f, i) => (
                    <button key={i} onClick={() => abrirLightbox(fotos, i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f} alt={`foto ${i + 1}`} className="h-20 w-20 rounded-xl border border-gray-200 object-cover transition-opacity hover:opacity-80" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <div className="relative flex items-center justify-center w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {lightbox.fotos.length > 1 && (
              <button onClick={() => navLightbox(-1)} className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 -translate-x-5">
                ‹
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.fotos[lightbox.idx]} alt="foto" className="max-h-[80vh] w-full rounded-2xl object-contain" />
            {lightbox.fotos.length > 1 && (
              <button onClick={() => navLightbox(1)} className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 translate-x-5">
                ›
              </button>
            )}
            {lightbox.fotos.length > 1 && (
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white">
                {lightbox.idx + 1} / {lightbox.fotos.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
