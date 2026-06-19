'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CapturaFotos from '@/components/ui/CapturaFotos'
import { useModo } from '@/context/ModoContext'

const COUNTDOWN = 10

interface AtividadeInfo { _id: string; nome: string; funcaoId: { nome: string } }

function RelogioContagem({ segundos, total }: { segundos: number; total: number }) {
  const r = 28
  const circunferencia = 2 * Math.PI * r
  const progresso = (segundos / total) * circunferencia
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#d1fae5" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#16a34a" strokeWidth="5"
          strokeDasharray={circunferencia} strokeDashoffset={circunferencia - progresso}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="absolute text-lg font-bold text-green-700">{segundos}</span>
    </div>
  )
}

function ExecutarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { funcionarioLogado } = useModo()
  const token = searchParams.get('t') ?? ''

  const [atividade, setAtividade] = useState<AtividadeInfo | null>(null)
  const [erroToken, setErroToken] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [countdown, setCountdown] = useState(COUNTDOWN)
  const [lightbox, setLightbox] = useState<{ idx: number } | null>(null)
  // ID da execução existente — se preenchido, faz PUT em vez de POST
  const [execucaoExistenteId, setExecucaoExistenteId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!token) { setErroToken('Token inválido.'); return }
    fetch(`/api/atividades/scan?t=${encodeURIComponent(token)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((ativ: AtividadeInfo) => {
        setAtividade(ativ)
        if (funcionarioLogado && ativ._id) {
          fetch(`/api/execucoes/verificar?atividadeId=${ativ._id}&funcionarioId=${funcionarioLogado.id}`)
            .then((r) => r.json())
            .then((res) => {
              if (res.jaRegistrada && res.execucao) {
                // Pré-preenche com os dados existentes
                setFotos(res.execucao.fotos ?? [])
                setObservacao(res.execucao.observacao ?? '')
                setExecucaoExistenteId(res.execucao._id)
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => setErroToken('Atividade não encontrada ou QR Code inválido.'))
  }, [token, funcionarioLogado])

  useEffect(() => {
    if (!sucesso) return
    setCountdown(COUNTDOWN)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); router.push('/atividades/escanear'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sucesso, router])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setLightbox((l) => l ? { idx: (l.idx + 1) % fotos.length } : null)
      else if (e.key === 'ArrowLeft') setLightbox((l) => l ? { idx: (l.idx - 1 + fotos.length) % fotos.length } : null)
      else if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, fotos.length])

  const modoEdicao = !!execucaoExistenteId

  async function salvar() {
    if (!atividade) return
    if (fotos.length === 0) { setErro('Tire ao menos 1 foto.'); return }
    if (!funcionarioLogado) { setErro('Você precisa estar logado como funcionário.'); return }
    setSalvando(true); setErro('')
    try {
      let res: Response
      if (modoEdicao) {
        res = await fetch(`/api/execucoes/${execucaoExistenteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fotos, observacao: observacao.trim() }),
        })
      } else {
        res = await fetch('/api/execucoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atividadeId: atividade._id, funcionarioId: funcionarioLogado.id, fotos, observacao: observacao.trim() }),
        })
      }
      if (!res.ok) { const d = await res.json(); throw new Error(d.erro ?? 'Erro') }
      setSucesso(true)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally { setSalvando(false) }
  }

  if (erroToken) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-700">{erroToken}</p>
      <button onClick={() => router.push('/atividades/escanear')} className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
        Escanear novamente
      </button>
    </div>
  )

  if (!atividade) return <div className="py-20 text-center text-sm text-gray-400">Carregando...</div>

  if (sucesso) return (
    <div className="flex flex-col items-center space-y-5 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {modoEdicao ? 'Registro atualizado!' : 'Atividade registrada!'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{atividade.nome}</p>
      </div>
      <RelogioContagem segundos={countdown} total={COUNTDOWN} />
      <p className="text-sm text-gray-400">Redirecionando em {countdown}s…</p>
      <Button onClick={() => { clearInterval(timerRef.current!); router.push('/atividades/escanear') }}>
        Escanear outra agora
      </Button>
      <button onClick={() => { clearInterval(timerRef.current!); router.push('/atividades') }} className="text-sm text-gray-400 hover:text-gray-600">
        Voltar ao início
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">← Voltar</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{atividade.nome}</h1>
          <p className="text-xs text-gray-500">{atividade.funcaoId?.nome}</p>
        </div>
      </div>

      {funcionarioLogado && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <span className="text-xs font-medium text-blue-600">Registrando como:</span>
          <span className="text-xs font-semibold text-blue-800">{funcionarioLogado.nome}</span>
        </div>
      )}

      {modoEdicao && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-500">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Editando registro de hoje</p>
            <p className="text-xs text-amber-700 mt-0.5">Esta atividade já foi registrada hoje. As fotos e observação atuais estão carregadas — ajuste o que precisar.</p>
          </div>
        </div>
      )}

      <Card title="Fotos">
        <>
          <CapturaFotos fotos={fotos} onChange={setFotos} obrigatorio />
          {fotos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setLightbox({ idx: i })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f} alt={'foto ' + (i + 1)} className="h-16 w-16 rounded-lg border-2 border-blue-200 object-cover hover:opacity-80" />
                </button>
              ))}
            </div>
          )}
        </>
      </Card>

      <Card title="Observação (opcional)">
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Descreva alguma observação relevante sobre a execução..."
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{observacao.length}/500</p>
      </Card>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <Button onClick={salvar} loading={salvando} disabled={fotos.length === 0} className="w-full justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-200">
        {modoEdicao ? 'Salvar alterações' : 'Confirmar execução'}
      </Button>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <div className="relative flex items-center justify-center w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {fotos.length > 1 && (
              <button onClick={() => setLightbox({ idx: (lightbox.idx - 1 + fotos.length) % fotos.length })}
                className="absolute -left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-2xl text-white hover:bg-black/60">‹</button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotos[lightbox.idx]} alt="foto" className="max-h-[80vh] w-full rounded-2xl object-contain" />
            {fotos.length > 1 && (
              <button onClick={() => setLightbox({ idx: (lightbox.idx + 1) % fotos.length })}
                className="absolute -right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-2xl text-white hover:bg-black/60">›</button>
            )}
            {fotos.length > 1 && (
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white">
                {lightbox.idx + 1} / {fotos.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaginaExecutar() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-gray-400">Carregando...</div>}>
      <ExecutarContent />
    </Suspense>
  )
}
