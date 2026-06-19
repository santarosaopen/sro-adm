'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import RelogioAtual from '@/components/ponto/RelogioAtual'
import SeletorPresenca from '@/components/ponto/SeletorPresenca'
import CapturaFoto from '@/components/ponto/CapturaFoto'
import TabelaHorariosPonto from '@/components/ponto/TabelaHorariosPonto'
import PresencaAtual, { PresencaAtualRef } from '@/components/ponto/PresencaAtual'
import Button from '@/components/ui/Button'
import { RegistroPonto } from '@/types'
import { distanciaMetros } from '@/lib/gps'
import { useModo } from '@/context/ModoContext'

// Modal de login para registrar por outro funcionário
function ModalOutroFuncionario({
  onConfirmar,
  onFechar,
}: {
  onConfirmar: (funcionarioId: string, nome: string) => void
  onFechar: () => void
}) {
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !senha) return
    setCarregando(true); setErro('')
    try {
      const res = await fetch('/api/operacional/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha }),
      }).then((r) => r.json())
      if (res.ok && res.tipo === 'funcionario') {
        onConfirmar(res.funcionarioId, res.nome)
      } else {
        setErro('Usuário ou senha incorretos.')
      }
    } catch {
      setErro('Erro ao verificar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onFechar}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-1 text-lg font-bold text-gray-900">Registro de presença por terceiro</h2>
        <p className="mb-5 text-sm text-gray-500">Informe as credenciais do funcionário para registrar a presença em seu nome.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuário"
            autoFocus
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={carregando} className="flex-1 justify-center">Confirmar</Button>
            <Button type="button" variant="secondary" onClick={onFechar}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

type Periodo = 'semana' | 'mes' | 'ano' | 'range'

interface GpsRef {
  latitude: number
  longitude: number
  raioMetros: number
}

function filtrarPorPeriodo(
  registros: RegistroPonto[],
  periodo: Periodo,
  dataInicio: string,
  dataFim: string
): RegistroPonto[] {
  if (periodo === 'range') {
    return registros.filter((r) => {
      const ts = new Date(r.timestamp)
      if (dataInicio && ts < new Date(dataInicio + 'T00:00:00')) return false
      if (dataFim && ts > new Date(dataFim + 'T23:59:59')) return false
      return true
    })
  }
  const agora = new Date()
  let inicio: Date
  if (periodo === 'semana') {
    inicio = new Date(agora)
    inicio.setDate(agora.getDate() - 6)
    inicio.setHours(0, 0, 0, 0)
  } else if (periodo === 'mes') {
    inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
  } else {
    inicio = new Date(agora.getFullYear(), 0, 1)
  }
  return registros.filter((r) => new Date(r.timestamp) >= inicio)
}

export default function PaginaPonto() {
  const { modo, funcionarioLogado } = useModo()
  const presencaRef = useRef<PresencaAtualRef>(null)
  const [funcionarioId, setFuncionarioId] = useState('')
  const [funcaoId, setFuncaoId] = useState('')
  const [foto, setFoto] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [gpsRef, setGpsRef] = useState<GpsRef | null>(null)
  const [jaPresente, setJaPresente] = useState(false)
  const [verificandoPresenca, setVerificandoPresenca] = useState(false)
  const [mostrarModalOutro, setMostrarModalOutro] = useState(false)
  const [registrandoPor, setRegistrandoPor] = useState<{ id: string; nome: string } | null>(null)

  useEffect(() => {
    // Se não há "registrando por outro", usa o logado
    if (!registrandoPor && funcionarioLogado) setFuncionarioId(funcionarioLogado.id)
  }, [funcionarioLogado, registrandoPor])

  function handleConfirmarOutro(id: string, nome: string) {
    setRegistrandoPor({ id, nome })
    setFuncionarioId(id)
    setFuncaoId('')
    setFoto(null)
    setMensagem(null)
    setJaPresente(false)
    setMostrarModalOutro(false)
  }

  function cancelarOutro() {
    setRegistrandoPor(null)
    setFuncionarioId(funcionarioLogado?.id ?? '')
    setFuncaoId('')
    setFoto(null)
    setMensagem(null)
    setJaPresente(false)
  }

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
      const data = await fetch('/api/ponto?funcionarioId=' + id).then((r) => r.json())
      setRegistros(Array.isArray(data) ? data : [])
    } finally {
      setCarregando(false)
    }
  }, [])

  const verificarPresencaHoje = useCallback(async (fid: string, fcid: string) => {
    if (!fid || !fcid) { setJaPresente(false); return }
    setVerificandoPresenca(true)
    try {
      const res = await fetch(
        '/api/ponto/verificar?funcionarioId=' + fid + '&funcaoId=' + fcid
      ).then((r) => r.json())
      setJaPresente(!!res.presente)
    } catch {
      setJaPresente(false)
    } finally {
      setVerificandoPresenca(false)
    }
  }, [])

  useEffect(() => {
    if (modo === 'operacional') {
      carregarRegistros(funcionarioId)
      verificarPresencaHoje(funcionarioId, funcaoId)
    }
  }, [funcionarioId, funcaoId, carregarRegistros, verificarPresencaHoje, modo])

  function handleFuncionarioChange(id: string) {
    setFuncionarioId(id)
    setMensagem(null)
    setFoto(null)
    setJaPresente(false)
  }

  function handleFuncaoChange(id: string) {
    setFuncaoId(id)
    setMensagem(null)
    setJaPresente(false)
    verificarPresencaHoje(funcionarioId, id)
  }

  function selecionarPeriodo(p: Periodo) {
    setPeriodo(p)
    setDataInicio('')
    setDataFim('')
  }

  const registrosFiltrados = filtrarPorPeriodo(registros, periodo, dataInicio, dataFim)

  async function verificarGPS(): Promise<{ ok: boolean; mensagem: string }> {
    if (!gpsRef) return { ok: true, mensagem: '' }
    if (!navigator.geolocation) {
      return { ok: false, mensagem: 'Geolocalização não suportada neste navegador.' }
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = distanciaMetros(
            pos.coords.latitude, pos.coords.longitude,
            gpsRef.latitude, gpsRef.longitude
          )
          if (dist > gpsRef.raioMetros) {
            resolve({
              ok: false,
              mensagem: 'Fora do local permitido. Você está a ' + Math.round(dist) + ' m do ponto de referência (limite: ' + gpsRef.raioMetros + ' m).',
            })
          } else {
            resolve({ ok: true, mensagem: '' })
          }
        },
        (err) => {
          if (err.code === 1) {
            resolve({ ok: false, mensagem: 'Acesso à localização negado. Permita o GPS no navegador para registrar.' })
          } else if (err.code === 2) {
            resolve({ ok: false, mensagem: 'Localização indisponível. Verifique se o GPS está ativo.' })
          } else {
            resolve({ ok: false, mensagem: 'Tempo esgotado ao obter localização. Tente novamente.' })
          }
        },
        { timeout: 12000, enableHighAccuracy: true }
      )
    })
  }

  async function registrarPresenca() {
    if (!funcionarioId) { setMensagem({ tipo: 'erro', texto: 'Selecione um funcionário.' }); return }
    if (!funcaoId) { setMensagem({ tipo: 'erro', texto: 'Selecione uma função.' }); return }
    if (!foto) { setMensagem({ tipo: 'erro', texto: 'Capture uma foto antes de registrar.' }); return }
    if (jaPresente) { setMensagem({ tipo: 'erro', texto: 'Presença já registrada nesta função hoje.' }); return }
    setSalvando(true)
    setMensagem(null)
    try {
      const gps = await verificarGPS()
      if (!gps.ok) { setMensagem({ tipo: 'erro', texto: gps.mensagem }); return }
      const res = await fetch('/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId, funcaoId, foto, timestamp: new Date().toISOString() }),
      })
      if (res.status === 409) {
        setJaPresente(true)
        setMensagem({ tipo: 'erro', texto: 'Presença já registrada nesta função hoje.' })
        return
      }
      if (!res.ok) throw new Error()
      setFoto(null)
      setFuncaoId('')
      setJaPresente(true)
      setMensagem({ tipo: 'sucesso', texto: 'Presença registrada com sucesso!' })
      // Após registrar por outro, volta para o funcionário logado
      if (registrandoPor) {
        setRegistrandoPor(null)
        setFuncionarioId(funcionarioLogado?.id ?? '')
      } else if (!funcionarioLogado) {
        setFuncionarioId('')
      }
      carregarRegistros(funcionarioId)
      presencaRef.current?.atualizar()
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao registrar presença. Tente novamente.' })
    } finally {
      setSalvando(false)
    }
  }

  if (modo === 'visualizacao') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presença Atual</h1>
          <p className="mt-1 text-sm text-gray-500">Funcionários presentes hoje</p>
        </div>
        <PresencaAtual ref={presencaRef} />
      </div>
    )
  }

  // Decide o que mostrar dentro do card de registro
  function renderCorpoCard() {
    if (verificandoPresenca && funcionarioId && funcaoId) {
      return <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-100" />
    }

    if (jaPresente && funcionarioId && funcaoId) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-green-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Presença já registrada nesta função hoje</p>
            <p className="text-xs text-green-600">Selecione outra função ou retorne amanhã.</p>
          </div>
        </div>
      )
    }

    if (!funcaoId) {
      return null
    }

    return (
      <>
        <CapturaFoto foto={foto} onCaptura={setFoto} onDescartar={() => setFoto(null)} />
        {mensagem && (
          <p className={'text-sm font-medium ' + (mensagem.tipo === 'sucesso' ? 'text-green-600' : 'text-red-600')}>
            {mensagem.texto}
          </p>
        )}
        <Button
          onClick={registrarPresenca}
          loading={salvando}
          disabled={!funcionarioId || !funcaoId}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-200"
        >
          Registrar Presença
        </Button>
      </>
    )
  }

  // Quem está sendo registrado agora
  const pessoaAtiva = registrandoPor ?? funcionarioLogado
  const funcionarioEstaFixo = !!pessoaAtiva

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Presença</h1>
          <p className="mt-1 text-sm text-gray-500">Registre a entrada com foto</p>
        </div>
        {funcionarioLogado && (
          <button
            onClick={() => setMostrarModalOutro(true)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Registro por terceiro
          </button>
        )}
      </div>

      {/* Banner de quem está sendo registrado */}
      {registrandoPor && (
        <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <p className="text-sm font-semibold text-indigo-800">Registrando por: {registrandoPor.nome}</p>
          </div>
          <button onClick={cancelarOutro} className="text-xs text-indigo-500 hover:text-indigo-700">
            Cancelar
          </button>
        </div>
      )}

      <RelogioAtual />

      <Card title="Registrar Presença">
        <div className="space-y-6">
          <SeletorPresenca
            funcionarioId={funcionarioId}
            funcaoId={funcaoId}
            onFuncionarioChange={handleFuncionarioChange}
            onFuncaoChange={handleFuncaoChange}
            funcionarioFixo={funcionarioEstaFixo}
          />
          {renderCorpoCard()}
        </div>
      </Card>

      {mostrarModalOutro && (
        <ModalOutroFuncionario
          onConfirmar={handleConfirmarOutro}
          onFechar={() => setMostrarModalOutro(false)}
        />
      )}

      {funcionarioId && (
        <Card title="Histórico de Presenças">
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">Período</p>
              <div className="flex gap-1">
                {(['semana', 'mes', 'ano'] as Periodo[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => selecionarPeriodo(p)}
                    className={'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ' + (periodo === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                  >
                    {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Data início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => { setDataInicio(e.target.value); setPeriodo('range') }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Data fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => { setDataFim(e.target.value); setPeriodo('range') }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {(dataInicio || dataFim) && (
              <button onClick={() => selecionarPeriodo('semana')} className="text-sm text-gray-400 hover:text-gray-600">
                Limpar
              </button>
            )}
          </div>
          <p className="mb-3 text-xs text-gray-400">
            {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? 's' : ''}
          </p>
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
