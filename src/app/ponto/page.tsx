'use client'

import { useState, useCallback, useEffect } from 'react'
import Card from '@/components/ui/Card'
import RelogioAtual from '@/components/ponto/RelogioAtual'
import SeletorFuncionario from '@/components/ponto/SeletorFuncionario'
import CapturaFoto from '@/components/ponto/CapturaFoto'
import TabelaHorariosPonto from '@/components/ponto/TabelaHorariosPonto'
import PresencaAtual from '@/components/ponto/PresencaAtual'
import Button from '@/components/ui/Button'
import { RegistroPonto } from '@/types'
import { distanciaMetros } from '@/lib/gps'
import { useModo } from '@/context/ModoContext'

interface GpsRef {
  latitude: number
  longitude: number
  raioMetros: number
}

export default function PaginaPonto() {
  const { modo } = useModo()
  const [funcionarioId, setFuncionarioId] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [gpsRef, setGpsRef] = useState<GpsRef | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/configuracao?chave=gps_latitude').then((r) => r.json()),
      fetch('/api/configuracao?chave=gps_longitude').then((r) => r.json()),
      fetch('/api/configuracao?chave=gps_raio_metros').then((r) => r.json()),
    ]).then(([latRes, lonRes, raioRes]) => {
      const lat = latRes?.valor ? Number(latRes.valor) : null
      const lon = lonRes?.valor ? Number(lonRes.valor) : null
      const raio = raioRes?.valor ? Number(raioRes.valor) : 100
      if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
        setGpsRef({ latitude: lat, longitude: lon, raioMetros: raio })
      }
    })
  }, [])

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
    if (modo === 'operacional') carregarRegistros(funcionarioId)
  }, [funcionarioId, carregarRegistros, modo])

  function handleFuncionarioChange(id: string) {
    setFuncionarioId(id)
    setMensagem(null)
  }

  const registrosFiltrados = registros.filter((r) => {
    const ts = new Date(r.timestamp)
    if (dataInicio && ts < new Date(dataInicio + 'T00:00:00')) return false
    if (dataFim && ts > new Date(dataFim + 'T23:59:59')) return false
    return true
  })

  async function verificarGPS(): Promise<{ ok: boolean; mensagem: string }> {
    if (!gpsRef) return { ok: true, mensagem: '' }
    if (!navigator.geolocation) return { ok: false, mensagem: 'Geolocalização não suportada neste navegador.' }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = distanciaMetros(pos.coords.latitude, pos.coords.longitude, gpsRef.latitude, gpsRef.longitude)
          if (dist > gpsRef.raioMetros) {
            resolve({ ok: false, mensagem: `Fora do local permitido. Você está a ${Math.round(dist)} m do ponto de referência (limite: ${gpsRef.raioMetros} m).` })
          } else {
            resolve({ ok: true, mensagem: '' })
          }
        },
        (err) => {
          if (err.code === 1) resolve({ ok: false, mensagem: 'Acesso à localização negado. Permita o GPS no navegador para registrar.' })
          else if (err.code === 2) resolve({ ok: false, mensagem: 'Localização indisponível. Verifique se o GPS está ativo.' })
          else resolve({ ok: false, mensagem: 'Tempo esgotado ao obter localização. Tente novamente.' })
        },
        { timeout: 12000, enableHighAccuracy: true }
      )
    })
  }

  async function registrar(tipo: 'entrada' | 'saida') {
    if (!funcionarioId) { setMensagem({ tipo: 'erro', texto: 'Selecione um funcionário.' }); return }
    if (!foto) { setMensagem({ tipo: 'erro', texto: 'Capture uma foto antes de registrar.' }); return }
    setSalvando(true)
    setMensagem(null)
    try {
      const gps = await verificarGPS()
      if (!gps.ok) { setMensagem({ tipo: 'erro', texto: gps.mensagem }); return }
      const res = await fetch('/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId, tipo, foto, timestamp: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error()
      setFoto(null)
      setMensagem({ tipo: 'sucesso', texto: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!` })
      carregarRegistros(funcionarioId)
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao registrar horário. Tente novamente.' })
    } finally {
      setSalvando(false)
    }
  }

  // Modo visualização: apenas mostra presença atual
  if (modo === 'visualizacao') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presença Atual</h1>
          <p className="mt-1 text-sm text-gray-500">Funcionários presentes hoje com base nos registros de horário</p>
        </div>
        <RelogioAtual />
        <PresencaAtual />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registro de Horário</h1>
        <p className="mt-1 text-sm text-gray-500">Registre entradas e saídas com foto</p>
      </div>

      <RelogioAtual />

      <Card title="Registrar Horário">
        <div className="space-y-6">
          <SeletorFuncionario value={funcionarioId} onChange={handleFuncionarioChange} />
          <CapturaFoto foto={foto} onCaptura={setFoto} onDescartar={() => setFoto(null)} />

          {mensagem && (
            <p className={`text-sm font-medium ${mensagem.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600'}`}>
              {mensagem.texto}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={() => registrar('entrada')} loading={salvando} disabled={!funcionarioId} className="bg-green-600 hover:bg-green-700 disabled:bg-green-200">
              Registrar Entrada
            </Button>
            <Button onClick={() => registrar('saida')} loading={salvando} disabled={!funcionarioId} className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200">
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
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Data fim</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            {(dataInicio || dataFim) && (
              <button onClick={() => { setDataInicio(''); setDataFim('') }} className="text-sm text-gray-400 hover:text-gray-600">
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
