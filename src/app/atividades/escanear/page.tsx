'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import jsQR from 'jsqr'
import { useModo } from '@/context/ModoContext'

const QR_PREFIX = 'SRO-ATIV:'

interface AtividadeDetectada {
  token: string
  nome: string
  jaRegistradaHoje: boolean
}

export default function PaginaEscanear() {
  const router = useRouter()
  const { funcionarioLogado } = useModo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [erro, setErro] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [atividade, setAtividade] = useState<AtividadeDetectada | null>(null)

  useEffect(() => {
    let active = true

    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          scan()
        }
      } catch {
        setErro('Não foi possível acessar a câmera. Verifique as permissões.')
      }
    }

    function scan() {
      if (!videoRef.current || !canvasRef.current || !active) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scan)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code?.data.startsWith(QR_PREFIX)) {
        const token = code.data.slice(QR_PREFIX.length)
        if (active) {
          parar()
          verificarAtividade(token)
        }
        return
      }
      rafRef.current = requestAnimationFrame(scan)
    }

    async function verificarAtividade(token: string) {
      setVerificando(true)
      try {
        const res = await fetch(`/api/atividades/scan?t=${encodeURIComponent(token)}`)
        if (!res.ok) { setErro('Atividade não encontrada ou QR Code inválido.'); return }
        const ativ = await res.json()

        let jaRegistradaHoje = false
        if (funcionarioLogado && ativ._id) {
          const res = await fetch(
            `/api/execucoes/verificar?atividadeId=${ativ._id}&funcionarioId=${funcionarioLogado.id}`
          ).then((r) => r.json())
          jaRegistradaHoje = !!res.jaRegistrada
        }

        setAtividade({ token, nome: ativ.nome, jaRegistradaHoje })
      } catch {
        setErro('Erro ao verificar atividade. Tente novamente.')
      } finally {
        setVerificando(false)
      }
    }

    iniciar()
    return () => { active = false; parar() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function parar() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  function prosseguir() {
    if (!atividade) return
    router.replace(`/atividades/executar?t=${encodeURIComponent(atividade.token)}`)
  }

  function reiniciar() {
    setAtividade(null)
    setErro('')
    // Remonta o useEffect reiniciando a câmera
    window.location.reload()
  }

  // ── Tela de confirmação após detectar ─────────────────────────────────────

  if (atividade) {
    return (
      <div className="flex flex-col items-center space-y-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M17 14h3M14 17v3" />
          </svg>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Atividade detectada</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{atividade.nome}</h2>
        </div>

        {atividade.jaRegistradaHoje && (
          <div className="flex w-full max-w-xs items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Já registrada hoje</p>
              <p className="mt-0.5 text-xs text-amber-700">Esta atividade já foi executada hoje. Você pode registrar novamente se necessário.</p>
            </div>
          </div>
        )}

        <div className="flex w-full max-w-xs flex-col gap-2">
          <button
            onClick={prosseguir}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {atividade.jaRegistradaHoje ? 'Registrar mesmo assim' : 'Registrar atividade'}
          </button>
          <button
            onClick={reiniciar}
            className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Escanear outro
          </button>
        </div>
      </div>
    )
  }

  // ── Scanner ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escanear Atividade</h1>
        <p className="mt-1 text-sm text-gray-500">Aponte a câmera para o QR Code da atividade</p>
      </div>

      {erro ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-red-700">{erro}</p>
          <button onClick={reiniciar} className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Tentar novamente
          </button>
        </div>
      ) : verificando ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Verificando atividade…</p>
        </div>
      ) : (
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black shadow-lg aspect-square">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br" />
            </div>
          </div>
        </div>
      )}

      {!erro && !verificando && (
        <button onClick={() => router.replace('/atividades')} className="text-sm text-gray-400 hover:text-gray-600">
          Cancelar
        </button>
      )}
    </div>
  )
}
