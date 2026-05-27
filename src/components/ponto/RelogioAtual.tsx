'use client'

import { useState, useEffect } from 'react'

export default function RelogioAtual() {
  const [agora, setAgora] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hora = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const dataStr = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="rounded-xl bg-blue-600 px-6 py-5 text-white">
      <p className="text-sm font-medium text-blue-200">Data e horário atual</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{hora}</p>
      <p className="mt-1 text-sm text-blue-100 capitalize">{dataStr}</p>
    </div>
  )
}
