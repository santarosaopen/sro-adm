'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Modo = 'visualizacao' | 'operacional'

interface FuncionarioLogado {
  id: string
  nome: string
}

interface ModoCtx {
  modo: Modo
  funcionarioLogado: FuncionarioLogado | null
  entrarOperacional: (username: string, senha: string) => Promise<boolean>
  sairOperacional: () => void
}

const Ctx = createContext<ModoCtx>({
  modo: 'visualizacao',
  funcionarioLogado: null,
  entrarOperacional: async () => false,
  sairOperacional: () => {},
})

export function ModoProvider({ children }: { children: React.ReactNode }) {
  const [modo, setModo] = useState<Modo>('visualizacao')
  const [funcionarioLogado, setFuncionarioLogado] = useState<FuncionarioLogado | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('sro_modo')
    if (saved === 'operacional') {
      setModo('operacional')
      const funcSaved = sessionStorage.getItem('sro_funcionario')
      if (funcSaved) setFuncionarioLogado(JSON.parse(funcSaved))
    }
  }, [])

  const entrarOperacional = useCallback(async (username: string, senha: string): Promise<boolean> => {
    const res = await fetch('/api/operacional/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, senha }),
    }).then((r) => r.json())

    if (res.ok) {
      setModo('operacional')
      sessionStorage.setItem('sro_modo', 'operacional')

      if (res.tipo === 'funcionario' && res.funcionarioId) {
        const func = { id: res.funcionarioId, nome: res.nome }
        setFuncionarioLogado(func)
        sessionStorage.setItem('sro_funcionario', JSON.stringify(func))
      } else {
        setFuncionarioLogado(null)
        sessionStorage.removeItem('sro_funcionario')
      }
      return true
    }
    return false
  }, [])

  function sairOperacional() {
    setModo('visualizacao')
    setFuncionarioLogado(null)
    sessionStorage.removeItem('sro_modo')
    sessionStorage.removeItem('sro_funcionario')
    // Recarrega para garantir que o estado da página reflita o modo visualização
    window.location.reload()
  }

  return (
    <Ctx.Provider value={{ modo, funcionarioLogado, entrarOperacional, sairOperacional }}>
      {children}
    </Ctx.Provider>
  )
}

export const useModo = () => useContext(Ctx)
