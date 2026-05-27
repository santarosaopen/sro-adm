'use client'

import { useEffect, useState } from 'react'
import { Funcionario } from '@/types'
import { dataHoje } from '@/lib/formatters'

interface Props {
  funcionarioId: string
  data: string
  onFuncionarioChange: (id: string) => void
  onDataChange: (data: string) => void
}

export default function SeletorFuncionario({
  funcionarioId,
  data,
  onFuncionarioChange,
  onDataChange,
}: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/funcionarios?ativos=true')
      .then((r) => r.json())
      .then((d) => setFuncionarios(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-10 animate-pulse rounded-lg bg-gray-200" />

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Funcionário</label>
        <select
          value={funcionarioId}
          onChange={(e) => onFuncionarioChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>
          {funcionarios.map((f) => (
            <option key={f._id} value={f._id}>
              {f.nome} — {f.cargo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Data</label>
        <input
          type="date"
          value={data}
          max={dataHoje()}
          onChange={(e) => onDataChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
