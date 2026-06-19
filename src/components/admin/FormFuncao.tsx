'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Funcao } from '@/types'

interface Props {
  funcao?: Funcao | null
  onSalvo: () => void
  onCancelar: () => void
}

export default function FormFuncao({ funcao, onSalvo, onCancelar }: Props) {
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setNome(funcao?.nome ?? '')
  }, [funcao])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) { setErro('Nome é obrigatório'); return }
    setLoading(true)
    try {
      const url = funcao ? `/api/funcoes/${funcao._id}` : '/api/funcoes'
      const method = funcao ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() }),
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
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome da Função</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Operador, Supervisor, Técnico..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{funcao ? 'Atualizar' : 'Criar'} Função</Button>
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
      </div>
    </form>
  )
}
