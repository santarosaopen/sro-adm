'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  chave: string
  nomeAtual?: string
  onAtualizado: (nome: string) => void
}

export default function FormNomeEmpresa({ chave, nomeAtual, onAtualizado }: Props) {
  const [valor, setValor] = useState(nomeAtual ?? '')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valor.trim()) return
    setLoading(true)
    try {
      await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor: valor.trim() }),
      })
      onAtualizado(valor.trim())
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
          Nome da empresa (ex: SABESP, COPEL)
        </label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: SABESP"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" loading={loading}>
        Salvar
      </Button>
      {sucesso && <span className="text-sm text-green-600">Salvo!</span>}
    </form>
  )
}
