'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { dataHoje } from '@/lib/formatters'

interface Props {
  onSalvo: () => void
}

export default function FormMedicao({ onSalvo }: Props) {
  const [valor, setValor] = useState('')
  const [data, setData] = useState(dataHoje())
  const [tipo, setTipo] = useState<'diaria' | 'mensal'>('diaria')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!valor || parseFloat(valor) < 0) {
      setErro('Informe um valor válido')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/energia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: parseFloat(valor), data, tipo }),
      })
      if (!res.ok) throw new Error()
      setValor('')
      setData(dataHoje())
      onSalvo()
    } catch {
      setErro('Erro ao salvar leitura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Valor (kWh)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'diaria' | 'mensal')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="diaria">Medição Diária</option>
            <option value="mensal">Leitura Companhia (Mensal)</option>
          </select>
        </div>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <Button type="submit" loading={loading}>
        Salvar Leitura
      </Button>
    </form>
  )
}
