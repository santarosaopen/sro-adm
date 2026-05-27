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
  const [cargo, setCargo] = useState('')
  const [atividades, setAtividades] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (funcionario) {
      setNome(funcionario.nome)
      setCargo(funcionario.cargo)
      setAtividades(funcionario.atividades.length ? funcionario.atividades : [''])
    } else {
      setNome('')
      setCargo('')
      setAtividades([''])
    }
  }, [funcionario])

  function addAtividade() {
    setAtividades((prev) => [...prev, ''])
  }

  function removeAtividade(i: number) {
    setAtividades((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateAtividade(i: number, valor: string) {
    setAtividades((prev) => prev.map((a, idx) => (idx === i ? valor : a)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nome.trim() || !cargo.trim()) {
      setErro('Nome e cargo são obrigatórios')
      return
    }

    const atividadesFiltradas = atividades.filter((a) => a.trim())
    setLoading(true)

    try {
      const url = funcionario ? `/api/funcionarios/${funcionario._id}` : '/api/funcionarios'
      const method = funcionario ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), cargo: cargo.trim(), atividades: atividadesFiltradas }),
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Cargo</label>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Operador, Supervisor..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Atividades diárias
        </label>
        <div className="space-y-2">
          {atividades.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input value={a} onChange={(e) => updateAtividade(i, e.target.value)} placeholder={`Atividade ${i + 1}`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {atividades.length > 1 && (
                <button type="button" onClick={() => removeAtividade(i)} className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addAtividade} className="mt-2 text-sm text-blue-600 hover:underline">
          + Adicionar atividade
        </button>
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
