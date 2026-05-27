'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Modo = 'visualizacao' | 'operacional'

interface ModoCtx {
  modo: Modo
  entrarOperacional: (username: string, senha: string) => Promise<boolean>
  sairOperacional: () => void
}

const Ctx = createContext<ModoCtx>({
  modo: 'visualizacao',
  entrarOperacional: async () => false,
  sairOperacional: () => {},
})

export function ModoProvider({ children }: { children: React.ReactNode }) {
  const [modo, setModo] = useState<Modo>('visualizacao')

  useEffect(() => {
    const saved = sessionStorage.getItem('sro_modo')
    if (saved === 'operacional') setModo('operacional')
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
      return true
    }
    return false
  }, [])

  function sairOperacional() {
    setModo('visualizacao')
    sessionStorage.removeItem('sro_modo')
  }

  return (
    <Ctx.Provider value={{ modo, entrarOperacional, sairOperacional }}>
      {children}
    </Ctx.Provider>
  )
}

export const useModo = () => useContext(Ctx)
