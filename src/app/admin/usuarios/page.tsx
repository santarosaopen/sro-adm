'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormAdminUser from '@/components/admin/FormAdminUser'

interface AdminUser { _id: string; username: string; nome: string; ativo: boolean }

export default function PaginaUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<AdminUser[]>([])
  const [editando, setEditando] = useState<AdminUser | null>(null)
  const [criando, setCriando] = useState(false)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const data = await fetch('/api/admin/usuarios').then((r) => r.json())
    setUsuarios(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function toggleAtivo(u: AdminUser) {
    await fetch(`/api/admin/usuarios/${u._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !u.ativo }) })
    carregar()
  }
  async function deletar(id: string) {
    if (!confirm('Remover este usuário?')) return
    await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    setUsuarios((prev) => prev.filter((u) => u._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Usuários Administrativos</h1>
      </div>
      {!criando && !editando && <Button onClick={() => setCriando(true)}>+ Novo Usuário</Button>}
      {(criando || editando) && (
        <Card title={editando ? `Editar: ${editando.username}` : 'Novo Usuário Admin'}>
          <FormAdminUser usuario={editando} onSalvo={() => { setCriando(false); setEditando(null); carregar() }} onCancelar={() => { setCriando(false); setEditando(null) }} />
        </Card>
      )}
      {loading ? <div className="py-8 text-center text-sm text-gray-400">Carregando...</div> : (
        <Card title={`Usuários (${usuarios.length})`}>
          {usuarios.length === 0 ? <p className="py-4 text-center text-sm text-gray-400">Nenhum usuário.</p> : (
            <div className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-3">
                  <div><p className="font-medium text-gray-900">{u.nome}</p><p className="text-sm text-gray-500">@{u.username}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                    <Button variant="secondary" className="text-xs" onClick={() => setEditando(u)}>Editar</Button>
                    <Button variant="secondary" className="text-xs" onClick={() => toggleAtivo(u)}>{u.ativo ? 'Desativar' : 'Ativar'}</Button>
                    <Button variant="secondary" className="text-xs text-red-600 hover:text-red-700" onClick={() => deletar(u._id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
