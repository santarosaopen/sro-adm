'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface AdminUser {
  _id: string
  username: string
  nome: string
  ativo: boolean
}

interface Props {
  usuario?: AdminUser | null
  onSalvo: () => void
  onCancelar: () => void
}

function EyeIcon({ aberto }: { aberto: boolean }) {
  return aberto ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CampoSenha({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [mostrar, setMostrar] = useState(false)
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={mostrar ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete="new-password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setMostrar((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <EyeIcon aberto={mostrar} />
        </button>
      </div>
    </div>
  )
}

export default function FormAdminUser({ usuario, onSalvo, onCancelar }: Props) {
  const editando = !!usuario
  const [username, setUsername] = useState(usuario?.username ?? '')
  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [senha, setSenha] = useState('')
  const [senhaOperacional, setSenhaOperacional] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const body: Record<string, unknown> = { nome }
      if (!editando) {
        body.username = username
        body.senha = senha
        if (senhaOperacional) body.senhaOperacional = senhaOperacional
      } else {
        if (senha) body.senha = senha
        if (senhaOperacional) body.senhaOperacional = senhaOperacional
      }

      const url = editando ? `/api/admin/usuarios/${usuario._id}` : '/api/admin/usuarios'
      const method = editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setErro(data.erro ?? 'Erro ao salvar usuário')
        return
      }

      onSalvo()
    } catch {
      setErro('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!editando && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            placeholder="ex: joaosilva"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome completo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <CampoSenha
        label={editando ? 'Nova senha administrativa (vazio = sem alteração)' : 'Senha administrativa'}
        value={senha}
        onChange={setSenha}
        placeholder={editando ? 'Nova senha (opcional)' : 'Senha de acesso ao painel admin'}
        required={!editando}
      />

      <div>
        <CampoSenha
          label={editando ? 'Nova senha operacional (vazio = sem alteração)' : 'Senha operacional (opcional)'}
          value={senhaOperacional}
          onChange={setSenhaOperacional}
          placeholder={editando ? 'Nova senha operacional (opcional)' : 'Deixar vazio para não configurar'}
        />
        <p className="mt-1 text-xs text-gray-400">
          Senha independente usada para habilitar o modo operacional no sistema.
        </p>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          {editando ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
