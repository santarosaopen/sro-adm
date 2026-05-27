'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  cotaAtual?: number
  onAtualizado: (novaCota: number) => void
}

export default function FormCota({ cotaAtual, onAtualizado }: Props) {
  const [valor, setValor] = useState(cotaAtual?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numValor = parseFloat(valor)
    if (isNaN(numValor) || numValor < 0) return

    setLoading(true)
    try {
      await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave: 'cota_agua', valor: numValor }),
      })
      onAtualizado(numValor)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Cota diária (m³)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 10,00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" loading={loading} size="md">
        Definir Cota
      </Button>
      {sucesso && <span className="text-sm text-green-600">Salvo!</span>}
    </form>
  )
}
