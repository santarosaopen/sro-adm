'use client'

import { useState, useEffect, useRef } from 'react'
import Button from './Button'

interface Props {
  onConfirmar: (username: string, senha: string) => Promise<boolean>
  onFechar: () => void
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

export default function ModalSenhaModo({ onConfirmar, onFechar }: Props) {
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !senha) return
    setCarregando(true)
    setErro('')
    const ok = await onConfirmar(username, senha)
    setCarregando(false)
    if (!ok) {
      setErro('Usuário ou senha incorretos.')
      setSenha('')
    }
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onFechar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Modo Operacional</h2>
        <p className="mb-5 text-sm text-gray-500">Informe suas credenciais para habilitar o modo operacional.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={usernameRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuário"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha operacional"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon aberto={mostrarSenha} />
            </button>
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={carregando} className="flex-1 justify-center">
              Entrar
            </Button>
            <Button type="button" variant="secondary" onClick={onFechar}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
