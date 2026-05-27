'use client'

import { useEffect, useState } from 'react'
import { formatarHora } from '@/lib/formatters'

interface Presente {
  funcionario: { _id: string; nome: string; cargo: string }
  foto: string
  timestamp: string
}

export default function PresencaAtual() {
  const [presentes, setPresentes] = useState<Presente[]>([])
  const [loading, setLoading] = useState(true)
  const [fotoAmpliada, setFotoAmpliada] = useState<Presente | null>(null)

  useEffect(() => {
    fetch('/api/ponto/presenca')
      .then((r) => r.json())
      .then((data) => setPresentes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      fetch('/api/ponto/presenca')
        .then((r) => r.json())
        .then((data) => setPresentes(Array.isArray(data) ? data : []))
    }, 120_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-gray-100 aspect-[3/4]" />
        ))}
      </div>
    )
  }

  if (!presentes.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-16 text-center">
        <p className="text-3xl">🏠</p>
        <p className="mt-3 text-sm font-medium text-gray-600">Nenhum funcionário presente no momento.</p>
        <p className="mt-1 text-xs text-gray-400">Atualizado automaticamente a cada 2 minutos.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        {presentes.length} funcionário{presentes.length !== 1 ? 's' : ''} presente{presentes.length !== 1 ? 's' : ''} agora
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {presentes.map((p) => (
          <button
            key={p.funcionario._id}
            onClick={() => setFotoAmpliada(p)}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 text-left"
          >
            {/* Foto em destaque */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.foto}
                alt={p.funcionario.nome}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
              {/* Badge de presença */}
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Presente
              </div>
            </div>

            {/* Informações */}
            <div className="p-3">
              <p className="font-semibold text-gray-900 truncate">{p.funcionario.nome}</p>
              <p className="text-xs text-gray-500 truncate">{p.funcionario.cargo}</p>
              <p className="mt-1.5 text-xs text-green-600 font-medium">
                Entrada: {formatarHora(p.timestamp)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de foto ampliada */}
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
              <p className="text-sm text-gray-500">{fotoAmpliada.funcionario.cargo}</p>
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
}
