'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Funcionario } from '@/types'

interface Props {
  funcionario?: Funcionario | null
  onSalvo: () => void
  onCancelar: () => void
}

export default function FormFuncionario({ funcionario, onSalvo, onCancelar }: Props) {
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setNome(funcionario?.nome ?? '')
    setUsername(funcionario?.username ?? '')
    setSenha('')
  }, [funcionario])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const url = funcionario ? `/api/funcionarios/${funcionario._id}` : '/api/funcionarios'
      const method = funcionario ? 'PUT' : 'POST'

      const body: Record<string, string> = { nome: nome.trim() }
      if (username.trim()) body.username = username.trim()
      if (senha) body.senha = senha

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()
      onSalvo()
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Usuário <span className="text-xs font-normal text-gray-400">(para login operacional)</span>
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: joao.silva"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {funcionario ? 'Nova senha' : 'Senha'}
            {funcionario && <span className="ml-1 text-xs font-normal text-gray-400">(deixe em branco para não alterar)</span>}
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder={funcionario ? 'Nova senha...' : 'Senha...'}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {funcionario ? 'Atualizar' : 'Criar'} Funcionário
        </Button>
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
