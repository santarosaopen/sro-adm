'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function FormSenhaOperacional() {
  const [configurado, setConfigurado] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/operacional/status')
      .then((r) => r.json())
      .then((d) => setConfigurado(d.configurado ?? false))
      .finally(() => setLoading(false))
  }, [])

  async function salvar() {
    if (novaSenha.length < 4) {
      setMensagem({ tipo: 'erro', texto: 'Senha deve ter no mínimo 4 caracteres.' })
      return
    }
    if (novaSenha !== confirmacao) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }
    setSalvando(true)
    setMensagem(null)
    try {
      const res = await fetch('/api/operacional/senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha }),
      })
      if (!res.ok) {
        const d = await res.json()
        setMensagem({ tipo: 'erro', texto: d.erro || 'Erro ao salvar.' })
        return
      }
      setConfigurado(true)
      setNovaSenha('')
      setConfirmacao('')
      setMensagem({ tipo: 'ok', texto: 'Senha do modo operacional salva.' })
    } finally {
      setSalvando(false)
    }
  }

  async function remover() {
    setRemovendo(true)
    setMensagem(null)
    try {
      await fetch('/api/operacional/senha', { method: 'DELETE' })
      setConfigurado(false)
      setMensagem({ tipo: 'ok', texto: 'Senha removida. O modo operacional ficará livre.' })
    } finally {
      setRemovendo(false)
    }
  }

  if (loading) return <div className="h-24 animate-pulse rounded-lg bg-gray-100" />

  return (
    <div className="space-y-4">
      {configurado ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Senha configurada — o modo operacional exige autenticação.
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Sem senha definida — qualquer usuário pode acessar o modo operacional.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {configurado ? 'Nova senha' : 'Definir senha'}
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 4 caracteres"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar senha</label>
          <input
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Repita a senha"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {mensagem && (
        <p className={`text-sm font-medium ${mensagem.tipo === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
          {mensagem.texto}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button loading={salvando} onClick={salvar}>
          {configurado ? 'Alterar senha' : 'Definir senha'}
        </Button>
        {configurado && (
          <Button variant="danger" loading={removendo} onClick={remover}>
            Remover senha
          </Button>
        )}
      </div>
    </div>
  )
}
