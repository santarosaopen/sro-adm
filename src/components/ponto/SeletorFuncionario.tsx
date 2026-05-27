'use client'

import { useEffect, useState } from 'react'
import { Funcionario } from '@/types'

interface Props {
  value: string
  onChange: (id: string) => void
}

export default function SeletorFuncionario({ value, onChange }: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/funcionarios?ativos=true')
      .then((r) => r.json())
      .then((data) => {
        setFuncionarios(Array.isArray(data) ? data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
    )
  }

  if (!funcionarios.length) {
    return (
      <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        Nenhum funcionário cadastrado. Acesse a área administrativa para adicionar.
      </p>
    )
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Funcionário
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Selecione um funcionário...</option>
        {funcionarios.map((f) => (
          <option key={f._id} value={f._id}>
            {f.nome} — {f.cargo}
          </option>
        ))}
      </select>
    </div>
  )
}
