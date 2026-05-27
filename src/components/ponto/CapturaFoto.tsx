'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  foto: string | null
  onCaptura: (foto: string) => void
  onDescartar: () => void
}

type ErroCamera = {
  tipo: 'permissao' | 'dispositivo' | 'outro'
  mensagem: string
}

export default function CapturaFoto({ foto, onCaptura, onDescartar }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [erro, setErro] = useState<ErroCamera | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Para o stream quando o componente é desmontado
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  async function ativarCamera() {
    setErro(null)
    setCameraAtiva(true)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (e: unknown) {
      setCameraAtiva(false)
      const err = e as DOMException

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErro({
          tipo: 'permissao',
          mensagem:
            'Permissão de câmera negada. Clique no ícone de câmera na barra de endereços do navegador e permita o acesso.',
        })
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        setErro({
          tipo: 'dispositivo',
          mensagem: 'Nenhuma câmera encontrada. Verifique se a webcam está conectada.',
        })
      } else {
        setErro({
          tipo: 'outro',
          mensagem: `Erro ao acessar câmera: ${err.message || err.name}`,
        })
      }
    }
  }

  const capturar = useCallback(() => {
    if (!videoRef.current || !stream) return

    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 320, 240)
    const imagem = canvas.toDataURL('image/jpeg', 0.6)

    stream.getTracks().forEach((t) => t.stop())
    setStream(null)
    setCameraAtiva(false)
    onCaptura(imagem)
  }, [stream, onCaptura])

  function cancelar() {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setCameraAtiva(false)
  }

  if (foto) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Foto capturada:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto}
          alt="Foto do registro"
          className="rounded-lg border border-gray-200"
          style={{ width: 320, height: 240, objectFit: 'cover' }}
        />
        <Button variant="secondary" size="sm" onClick={onDescartar}>
          Tirar nova foto
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Câmera:</p>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {erro.tipo === 'permissao' && '🔒 Permissão negada'}
            {erro.tipo === 'dispositivo' && '📷 Câmera não encontrada'}
            {erro.tipo === 'outro' && '⚠️ Erro de câmera'}
          </p>
          <p className="mt-1 text-sm text-red-600">{erro.mensagem}</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={ativarCamera}>
            Tentar novamente
          </Button>
        </div>
      )}

      {cameraAtiva && !erro && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={320}
            height={240}
            className="rounded-lg border border-gray-200 bg-gray-100"
            onLoadedMetadata={() => videoRef.current?.play()}
          />
          <div className="flex gap-2">
            <Button onClick={capturar}>Capturar Foto</Button>
            <Button variant="secondary" onClick={cancelar}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!cameraAtiva && !erro && (
        <Button variant="secondary" onClick={ativarCamera}>
          Ativar Câmera
        </Button>
      )}
    </div>
  )
}
