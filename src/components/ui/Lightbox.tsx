'use client'

import { useEffect } from 'react'

interface Props {
  fotos: string[]
  idx: number
  onClose: () => void
  onNav: (delta: number) => void
}

export default function Lightbox({ fotos, idx, onClose, onNav }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNav, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative flex w-full max-w-lg items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {fotos.length > 1 && (
          <button
            onClick={() => onNav(-1)}
            className="absolute -left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-2xl text-white hover:bg-black/60"
          >
            ‹
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[idx]} alt={`foto ${idx + 1}`} className="max-h-[80vh] w-full rounded-2xl object-contain" />
        {fotos.length > 1 && (
          <button
            onClick={() => onNav(1)}
            className="absolute -right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-2xl text-white hover:bg-black/60"
          >
            ›
          </button>
        )}
        {fotos.length > 1 && (
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white">
            {idx + 1} / {fotos.length}
          </p>
        )}
      </div>
    </div>
  )
}
