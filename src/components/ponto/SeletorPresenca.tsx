'use client'

import { useEffect, useState } from 'react'
import { Funcionario, Funcao } from '@/types'

interface Props {
  funcionarioId: string
  funcaoId: string
  onFuncionarioChange: (id: string) => void
  onFuncaoChange: (id: string) => void
  funcionarioFixo?: boolean
}

export default function SeletorPresenca({
  funcionarioId,
  funcaoId,
  onFuncionarioChange,
  onFuncaoChange,
  funcionarioFixo = false,
}: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/funcionarios?ativos=true').then((r) => r.json()),
      fetch('/api/funcoes?ativas=true').then((r) => r.json()),
    ])
      .then(([funcs, funcaoList]) => {
        setFuncionarios(Array.isArray(funcs) ? funcs : [])
        setFuncoes(Array.isArray(funcaoList) ? funcaoList : [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (!funcionarios.length) {
    return (
      <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        Nenhum funcionário cadastrado. Acesse a área administrativa para adicionar.
      </p>
    )
  }

  if (!funcoes.length) {
    return (
      <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        Nenhuma função cadastrada. Acesse a área administrativa para adicionar.
      </p>
    )
  }

  const nomeFuncionarioFixo = funcionarios.find((f) => f._id === funcionarioId)?.nome

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Funcionário</label>
        {funcionarioFixo ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <span className="font-medium">{nomeFuncionarioFixo}</span>
            <span className="ml-auto text-xs text-gray-400">logado</span>
          </div>
        ) : (
          <select
            value={funcionarioId}
            onChange={(e) => onFuncionarioChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecione um funcionário...</option>
            {funcionarios.map((f) => (
              <option key={f._id} value={f._id}>{f.nome}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Função</label>
        <select
          value={funcaoId}
          onChange={(e) => onFuncaoChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecione uma função...</option>
          {funcoes.map((f) => (
            <option key={f._id} value={f._id}>{f.nome}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
