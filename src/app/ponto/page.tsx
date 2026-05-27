'use client'

import { useState, useCallback, useEffect } from 'react'
import Card from '@/components/ui/Card'
import RelogioAtual from '@/components/ponto/RelogioAtual'
import SeletorFuncionario from '@/components/ponto/SeletorFuncionario'
import CapturaFoto from '@/components/ponto/CapturaFoto'
import TabelaHorariosPonto from '@/components/ponto/TabelaHorariosPonto'
import Button from '@/components/ui/Button'
import { RegistroPonto } from '@/types'

export default function PaginaPonto() {
  const [funcionarioId, setFuncionarioId] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const carregarRegistros = useCallback(async (id: string) => {
    if (!id) { setRegistros([]); return }
    setCarregando(true)
    try {
      const data = await fetch(`/api/ponto?funcionarioId=${id}`).then((r) => r.json())
      setRegistros(Array.isArray(data) ? data : [])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarRegistros(funcionarioId)
  }, [funcionarioId, carregarRegistros])

  function handleFuncionarioChange(id: string) {
    setFuncionarioId(id)
    setMensagem('')
  }

  const registrosFiltrados = registros.filter((r) => {
    const ts = new Date(r.timestamp)
    if (dataInicio && ts < new Date(dataInicio + 'T00:00:00')) return false
    if (dataFim && ts > new Date(dataFim + 'T23:59:59')) return false
    return true
  })

  async function registrar(tipo: 'entrada' | 'saida') {
    if (!funcionarioId) { setMensagem('Selecione um funcionário.'); return }
    if (!foto) { setMensagem('Capture uma foto antes de registrar.'); return }

    setSalvando(true)
    setMensagem('')
    try {
      const res = await fetch('/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId, tipo, foto, timestamp: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error()
      setFoto(null)
      setMensagem(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`)
      carregarRegistros(funcionarioId)
    } catch {
      setMensagem('Erro ao registrar ponto. Tente novamente.')
    } finally {
      setSalvando(false)
    }
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
          <SeletorFuncionario value={funcionarioId} onChange={handleFuncionarioChange} />
          <CapturaFoto foto={foto} onCaptura={setFoto} onDescartar={() => setFoto(null)} />

          {mensagem && (
            <p className={`text-sm font-medium ${mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
              {mensagem}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => registrar('entrada')}
              loading={salvando}
              disabled={!funcionarioId}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-200"
            >
              Registrar Entrada
            </Button>
            <Button
              onClick={() => registrar('saida')}
              loading={salvando}
              disabled={!funcionarioId}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200"
            >
              Registrar Saída
            </Button>
          </div>
        </div>
      </Card>

      {funcionarioId && (
        <Card title="Histórico de Horários">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Data início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Data fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {(dataInicio || dataFim) && (
              <button
                onClick={() => { setDataInicio(''); setDataFim('') }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Limpar filtro
              </button>
            )}
          </div>

          {carregando ? (
            <div className="py-6 text-center text-sm text-gray-400">Carregando...</div>
          ) : (
            <TabelaHorariosPonto registros={registrosFiltrados} />
          )}
        </Card>
      )}
    </div>
  )
}
