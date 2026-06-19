'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormFuncionario from '@/components/admin/FormFuncionario'
import ListaFuncionarios from '@/components/admin/ListaFuncionarios'
import { Funcionario } from '@/types'

export default function PaginaFuncionarios() {
  const router = useRouter()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [criando, setCriando] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const data = await fetch('/api/funcionarios').then((r) => r.json())
    setFuncionarios(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function toggleAtivo(f: Funcionario) {
    await fetch(`/api/funcionarios/${f._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !f.ativo }) })
    carregar()
  }
  async function deletar(id: string) {
    await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' })
    setFuncionarios((prev) => prev.filter((f) => f._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Funcionários</h1>
      </div>
      {!criando && !editando && <Button onClick={() => setCriando(true)}>+ Novo Funcionário</Button>}
      {(criando || editando) && (
        <Card title={editando ? 'Editar Funcionário' : 'Novo Funcionário'}>
          <FormFuncionario funcionario={editando} onSalvo={() => { setCriando(false); setEditando(null); carregar() }} onCancelar={() => { setCriando(false); setEditando(null) }} />
        </Card>
      )}
      {loading ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : (
        <Card><ListaFuncionarios funcionarios={funcionarios} onEditar={setEditando} onDeletar={deletar} onToggleAtivo={toggleAtivo} /></Card>
      )}
    </div>
  )
}
