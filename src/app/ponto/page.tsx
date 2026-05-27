'use client'

import { useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import RelogioAtual from '@/components/ponto/RelogioAtual'
import SeletorFuncionario from '@/components/ponto/SeletorFuncionario'
import CapturaFoto from '@/components/ponto/CapturaFoto'
import TabelaPontos from '@/components/admin/TabelaPontos'
import Button from '@/components/ui/Button'
import { RegistroPonto } from '@/types'
import { useEffect } from 'react'

export default function PaginaPonto() {
  const [funcionarioId, setFuncionarioId] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const carregarRegistros = useCallback(async () => {
    const data = await fetch('/api/ponto?').then((r) => r.json())
    setRegistros(Array.isArray(data) ? data.slice(0, 20) : [])
  }, [])

  useEffect(() => {
    carregarRegistros()
  }, [carregarRegistros])

  async function registrar(tipo: 'entrada' | 'saida') {
    if (!funcionarioId) {
      setMensagem('Selecione um funcionário.')
      return
    }
    if (!foto) {
      setMensagem('Capture uma foto antes de registrar.')
      return
    }

    setSalvando(true)
    setMensagem('')
    try {
      const res = await fetch('/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionarioId,
          tipo,
          foto,
          timestamp: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error()
      setFoto(null)
      setMensagem(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`)
      carregarRegistros()
    } catch {
      setMensagem('Erro ao registrar ponto. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function deletarRegistro(id: string) {
    await fetch(`/api/ponto/${id}`, { method: 'DELETE' })
    setRegistros((prev) => prev.filter((r) => r._id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ponto de Funcionários</h1>
        <p className="mt-1 text-sm text-gray-500">Registre entradas e saídas com foto</p>
      </div>

      <RelogioAtual />

      <Card title="Registrar Ponto">
        <div className="space-y-6">
          <SeletorFuncionario value={funcionarioId} onChange={setFuncionarioId} />

          <CapturaFoto
            foto={foto}
            onCaptura={setFoto}
            onDescartar={() => setFoto(null)}
          />

          {mensagem && (
            <p className={`text-sm ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
              {mensagem}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => registrar('entrada')}
              loading={salvando}
              className="bg-green-600 hover:bg-green-700"
            >
              Registrar Entrada
            </Button>
            <Button
              onClick={() => registrar('saida')}
              loading={salvando}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Registrar Saída
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Últimos 20 Registros">
        <TabelaPontos registros={registros} onDeletar={deletarRegistro} />
      </Card>
    </div>
  )
}
