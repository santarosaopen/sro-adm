'use client'

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { formatarHora } from '@/lib/formatters'

interface Presente {
  funcionario: { _id: string; nome: string }
  funcao: { _id: string; nome: string }
  foto: string
  timestamp: string
}

export interface PresencaAtualRef {
  atualizar: () => void
}

const PresencaAtual = forwardRef<PresencaAtualRef>((_, ref) => {
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<Presente | null>(null)

  const buscar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    else setAtualizando(true)
    try {
      const data = await fetch('/api/ponto/presenca').then((r) => r.json())
      setPresentes(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    buscar()
    const interval = setInterval(() => buscar(true), 60_000)

    function handleVisibilidade() {
      if (!document.hidden) buscar(true)
    }
    document.addEventListener('visibilitychange', handleVisibilidade)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilidade)
    }
  }, [buscar])

  useImperativeHandle(ref, () => ({ atualizar: () => buscar(true) }), [buscar])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-gray-100 aspect-[3/4]" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {presentes.length === 0
            ? 'Nenhum funcionário presente no momento.'
            : `${presentes.length} funcionário${presentes.length !== 1 ? 's' : ''} presente${presentes.length !== 1 ? 's' : ''} agora`}
        </p>
        <button
          onClick={() => buscar(true)}
          disabled={atualizando}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={atualizando ? 'animate-spin' : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {atualizando ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      {presentes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
          <p className="text-3xl">🏠</p>
          <p className="mt-3 text-sm font-medium text-gray-600">Nenhum funcionário presente no momento.</p>
          <p className="mt-1 text-xs text-gray-400">Atualizado automaticamente a cada minuto.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {presentes.map((p) => (
            <button
              key={p.funcionario._id}
              onClick={() => setFotoAmpliada(p)}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 text-left"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.foto}
                  alt={p.funcionario.nome}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Presente
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900 truncate">{p.funcionario.nome}</p>
                <p className="text-xs text-gray-500 truncate">{p.funcao.nome}</p>
                <p className="mt-1.5 text-xs text-green-600 font-medium">
                  Entrada: {formatarHora(p.timestamp)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoAmpliada.foto}
              alt={fotoAmpliada.funcionario.nome}
              className="w-full object-cover"
            />
            <div className="p-4">
              <p className="text-lg font-bold text-gray-900">{fotoAmpliada.funcionario.nome}</p>
              <p className="text-sm text-gray-500">{fotoAmpliada.funcao.nome}</p>
              <p className="mt-1 text-sm text-green-600 font-medium">
                Entrada: {formatarHora(fotoAmpliada.timestamp)}
              </p>
            </div>
            <button
              onClick={() => setFotoAmpliada(null)}
              className="w-full border-t border-gray-100 py-3 text-sm text-gray-500 hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
})

PresencaAtual.displayName = 'PresencaAtual'
export default PresencaAtual
