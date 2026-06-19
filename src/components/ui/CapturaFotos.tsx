'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Button from './Button'

interface Props {
  fotos: string[]
  onChange: (fotos: string[]) => void
  max?: number
  obrigatorio?: boolean
}

export default function CapturaFotos({ fotos, onChange, max, obrigatorio = true }: Props) {
  const [capturando, setCapturando] = useState(false)
  const [erroCamera, setErroCamera] = useState('')
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [cameraIdx, setCameraIdx] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const pararStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const iniciarComDeviceId = useCallback(async (deviceId: string) => {
    pararStream()
    setErroCamera('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErroCamera('Permissão de câmera negada. Permita o acesso nas configurações do navegador.')
      } else {
        setErroCamera('Não foi possível acessar a câmera. Verifique se outro aplicativo está usando-a.')
      }
    }
  }, [pararStream])

  // Abre a câmera pela primeira vez: obtém permissão, enumera dispositivos
  // e seleciona automaticamente a câmera traseira se disponível
  const iniciarCamera = useCallback(async () => {
    pararStream()
    setErroCamera('')
    try {
      // 1ª abertura sem deviceId para obter permissão e labels
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Enumera câmeras agora que temos permissão
      const devices = await navigator.mediaDevices.enumerateDevices()
      const vids = devices.filter((d) => d.kind === 'videoinput')
      setCameras(vids)

      // Descobre qual câmera está ativa e sincroniza o índice
      const trackSettings = stream.getVideoTracks()[0]?.getSettings()
      const activeId = trackSettings?.deviceId
      const idx = activeId ? vids.findIndex((v) => v.deviceId === activeId) : 0
      setCameraIdx(idx >= 0 ? idx : 0)
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErroCamera('Permissão de câmera negada. Permita o acesso nas configurações do navegador.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErroCamera('Nenhuma câmera encontrada neste dispositivo.')
      } else {
        setErroCamera('Não foi possível acessar a câmera. Verifique se outro aplicativo está usando-a.')
      }
    }
  }, [pararStream])

  useEffect(() => {
    if (capturando) {
      iniciarCamera()
    } else {
      pararStream()
      setCameras([])
      setCameraIdx(0)
    }
    return pararStream
  }, [capturando, iniciarCamera, pararStream])

  // Troca de câmera: calcula o próximo índice, atualiza estado E inicia imediatamente
  // sem depender do re-render para obter o novo índice
  async function trocarCamera() {
    if (cameras.length <= 1) return
    const novoIdx = (cameraIdx + 1) % cameras.length
    setCameraIdx(novoIdx)
    await iniciarComDeviceId(cameras[novoIdx].deviceId)
  }

  function capturar() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const img = canvas.toDataURL('image/jpeg', 0.85)
    onChange([...fotos, img])
    setCapturando(false)
  }

  function remover(i: number) {
    onChange(fotos.filter((_, idx) => idx !== i))
  }

  const podeAdicionar = max === undefined || fotos.length < max
  const label = fotos.length === 0
    ? (obrigatorio ? 'Tirar foto (obrigatória)' : 'Tirar foto')
    : podeAdicionar ? 'Adicionar foto' : null

  return (
    <div className="space-y-4">
      {fotos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {fotos.map((f, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt={`Foto ${i + 1}`} className="h-28 w-28 rounded-xl border border-gray-200 object-cover" />
              <button
                onClick={() => remover(i)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {capturando && (
        <div className="space-y-3">
          {erroCamera ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
              <p className="text-sm text-red-700">{erroCamera}</p>
            </div>
          ) : (
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex gap-2">
            {!erroCamera && (
              <Button onClick={capturar} className="flex-1 justify-center">Capturar</Button>
            )}
            {cameras.length > 1 && !erroCamera && (
              <Button variant="secondary" onClick={trocarCamera} title="Trocar câmera">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => { setCapturando(false); setErroCamera('') }}
              className={erroCamera ? 'flex-1 justify-center' : ''}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!capturando && podeAdicionar && label && (
        <button
          onClick={() => { setErroCamera(''); setCapturando(true) }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {label}
        </button>
      )}

      <p className="text-right text-xs text-gray-400">
        {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
        {max !== undefined ? ` / máx. ${max}` : ''}
      </p>
    </div>
  )
}
