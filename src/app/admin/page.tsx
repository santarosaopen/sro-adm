'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormFuncionario from '@/components/admin/FormFuncionario'
import ListaFuncionarios from '@/components/admin/ListaFuncionarios'
import TabelaPontos from '@/components/admin/TabelaPontos'
import { Funcionario, RegistroPonto } from '@/types'

type Aba = 'funcionarios' | 'pontos'

export default function PaginaAdmin() {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('funcionarios')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [criando, setCriando] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregarFuncionarios = useCallback(async () => {
    const data = await fetch('/api/funcionarios').then((r) => r.json())
    setFuncionarios(Array.isArray(data) ? data : [])
  }, [])

  const carregarPontos = useCallback(async () => {
    const data = await fetch('/api/ponto').then((r) => r.json())
    setRegistros(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    Promise.all([carregarFuncionarios(), carregarPontos()]).finally(() => setLoading(false))
  }, [carregarFuncionarios, carregarPontos])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  async function toggleAtivo(funcionario: Funcionario) {
    await fetch(`/api/funcionarios/${funcionario._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !funcionario.ativo }),
    })
    carregarFuncionarios()
  }

  async function deletarFuncionario(id: string) {
    await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' })
    setFuncionarios((prev) => prev.filter((f) => f._id !== id))
  }

  async function deletarPonto(id: string) {
    await fetch(`/api/ponto/${id}`, { method: 'DELETE' })
    setRegistros((prev) => prev.filter((r) => r._id !== id))
  }

  function handleSalvoFuncionario() {
    setCriando(false)
    setEditando(null)
    carregarFuncionarios()
  }

  if (loading) return <div className="py-20 text-center text-gray-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie funcionários e registros</p>
        </div>
        <Button variant="secondary" onClick={logout}>Sair</Button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {([
          { key: 'funcionarios', label: `Funcionários (${funcionarios.length})` },
          { key: 'pontos', label: `Registros de Ponto (${registros.length})` },
        ] as { key: Aba; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAba(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              aba === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {aba === 'funcionarios' && (
        <div className="space-y-4">
          {!criando && !editando && (
            <Button onClick={() => setCriando(true)}>+ Novo Funcionário</Button>
          )}

          {(criando || editando) && (
            <Card title={editando ? 'Editar Funcionário' : 'Novo Funcionário'}>
              <FormFuncionario
                funcionario={editando}
                onSalvo={handleSalvoFuncionario}
                onCancelar={() => { setCriando(false); setEditando(null) }}
              />
            </Card>
          )}

          <Card>
            <ListaFuncionarios
              funcionarios={funcionarios}
              onEditar={setEditando}
              onDeletar={deletarFuncionario}
              onToggleAtivo={toggleAtivo}
            />
          </Card>
        </div>
      )}

      {aba === 'pontos' && (
        <Card>
          <TabelaPontos registros={registros} onDeletar={deletarPonto} />
        </Card>
      )}
    </div>
  )
}
