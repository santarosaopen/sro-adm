'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormFuncionario from '@/components/admin/FormFuncionario'
import ListaFuncionarios from '@/components/admin/ListaFuncionarios'
import TabelaPontos from '@/components/admin/TabelaPontos'
import TabelaLeituras from '@/components/admin/TabelaLeituras'
import FormCota from '@/components/agua/FormCota'
import { Funcionario, RegistroPonto, LeituraAgua, LeituraEnergia } from '@/types'

type Aba = 'funcionarios' | 'pontos' | 'medidas' | 'configuracoes'
type Periodo = 'semana' | 'mes' | 'ano' | 'range'

function filtrarRegistros(
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

export default function PaginaAdmin() {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('funcionarios')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [criando, setCriando] = useState(false)
  const [loading, setLoading] = useState(true)

  // Pontos
  const [funcionarioIdPonto, setFuncionarioIdPonto] = useState('')
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [carregandoPontos, setCarregandoPontos] = useState(false)

  // Medidas
  const [leiturasAgua, setLeiturasAgua] = useState<LeituraAgua[]>([])
  const [leiturasEnergia, setLeiturasEnergia] = useState<LeituraEnergia[]>([])
  const [carregandoMedidas, setCarregandoMedidas] = useState(false)
  const [tipoMedida, setTipoMedida] = useState<'agua' | 'energia'>('agua')

  // Configurações
  const [cotaAtual, setCotaAtual] = useState<number | undefined>()

  const carregarFuncionarios = useCallback(async () => {
    const data = await fetch('/api/funcionarios').then((r) => r.json())
    setFuncionarios(Array.isArray(data) ? data : [])
  }, [])

  const carregarCota = useCallback(async () => {
    const res = await fetch('/api/configuracao?chave=cota_agua').then((r) => r.json())
    if (res?.valor) setCotaAtual(Number(res.valor))
  }, [])

  const carregarMedidas = useCallback(async () => {
    setCarregandoMedidas(true)
    try {
      const [aguaRes, energiaRes] = await Promise.all([
        fetch('/api/agua').then((r) => r.json()),
        fetch('/api/energia').then((r) => r.json()),
      ])
      setLeiturasAgua(Array.isArray(aguaRes) ? aguaRes : [])
      setLeiturasEnergia(Array.isArray(energiaRes) ? energiaRes : [])
    } finally {
      setCarregandoMedidas(false)
    }
  }, [])

  useEffect(() => {
    Promise.all([carregarFuncionarios(), carregarCota()]).finally(() => setLoading(false))
  }, [carregarFuncionarios, carregarCota])

  useEffect(() => {
    if (aba === 'medidas') carregarMedidas()
  }, [aba, carregarMedidas])

  const carregarPontos = useCallback(async (id: string) => {
    if (!id) { setRegistros([]); return }
    setCarregandoPontos(true)
    try {
      const data = await fetch(`/api/ponto?funcionarioId=${id}`).then((r) => r.json())
      setRegistros(Array.isArray(data) ? data : [])
    } finally {
      setCarregandoPontos(false)
    }
  }, [])

  useEffect(() => {
    carregarPontos(funcionarioIdPonto)
  }, [funcionarioIdPonto, carregarPontos])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  async function toggleAtivo(funcionario: Funcionario) {
    await fetch(`/api/funcionarios/${funcionario._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !funcionario.ativo }),
    })
    carregarFuncionarios()
  }

  async function deletarFuncionario(id: string) {
    await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' })
    setFuncionarios((prev) => prev.filter((f) => f._id !== id))
  }

  async function deletarPonto(id: string) {
    await fetch(`/api/ponto/${id}`, { method: 'DELETE' })
    setRegistros((prev) => prev.filter((r) => r._id !== id))
  }

  function handleSalvoFuncionario() {
    setCriando(false)
    setEditando(null)
    carregarFuncionarios()
  }

  const abas: { key: Aba; label: string }[] = [
    { key: 'funcionarios', label: `Funcionários (${funcionarios.length})` },
    { key: 'pontos', label: 'Registros de Ponto' },
    { key: 'medidas', label: 'Medidas' },
    { key: 'configuracoes', label: 'Configurações' },
  ]

  const registrosFiltrados = filtrarRegistros(registros, periodo, dataInicio, dataFim)

  if (loading) return <div className="py-20 text-center text-gray-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie funcionários e registros</p>
        </div>
        <Button variant="secondary" onClick={logout}>Sair</Button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {abas.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAba(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              aba === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {aba === 'funcionarios' && (
        <div className="space-y-4">
          {!criando && !editando && (
            <Button onClick={() => setCriando(true)}>+ Novo Funcionário</Button>
          )}
          {(criando || editando) && (
            <Card title={editando ? 'Editar Funcionário' : 'Novo Funcionário'}>
              <FormFuncionario
                funcionario={editando}
                onSalvo={handleSalvoFuncionario}
                onCancelar={() => { setCriando(false); setEditando(null) }}
              />
            </Card>
          )}
          <Card>
            <ListaFuncionarios
              funcionarios={funcionarios}
              onEditar={setEditando}
              onDeletar={deletarFuncionario}
              onToggleAtivo={toggleAtivo}
            />
          </Card>
        </div>
      )}

      {aba === 'pontos' && (
        <div className="space-y-4">
          <Card title="Filtros">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Funcionário</label>
                <select
                  value={funcionarioIdPonto}
                  onChange={(e) => setFuncionarioIdPonto(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Selecione um funcionário...</option>
                  {funcionarios.map((f) => (
                    <option key={f._id} value={f._id!}>
                      {f.nome} — {f.cargo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Período rápido</label>
                <div className="flex gap-1">
                  {(['semana', 'mes', 'ano'] as Periodo[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPeriodo(p); setDataInicio(''); setDataFim('') }}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        periodo === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setPeriodo('range') }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Data fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setPeriodo('range') }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {!funcionarioIdPonto ? (
            <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Selecione um funcionário para visualizar os registros de ponto.
            </p>
          ) : carregandoPontos ? (
            <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>
          ) : (
            <Card title={`${registrosFiltrados.length} registro${registrosFiltrados.length !== 1 ? 's' : ''} encontrado${registrosFiltrados.length !== 1 ? 's' : ''}`}>
              <TabelaPontos registros={registrosFiltrados} onDeletar={deletarPonto} />
            </Card>
          )}
        </div>
      )}

      {aba === 'medidas' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTipoMedida('agua')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tipoMedida === 'agua'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Água
            </button>
            <button
              onClick={() => setTipoMedida('energia')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tipoMedida === 'energia'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Energia
            </button>
          </div>

          {carregandoMedidas ? (
            <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>
          ) : tipoMedida === 'agua' ? (
            <Card title={`Leituras de Água (${leiturasAgua.length})`}>
              <TabelaLeituras
                leituras={leiturasAgua}
                unidade="m³"
                apiPath="agua"
                onAtualizado={carregarMedidas}
              />
            </Card>
          ) : (
            <Card title={`Leituras de Energia (${leiturasEnergia.length})`}>
              <TabelaLeituras
                leituras={leiturasEnergia}
                unidade="kWh"
                apiPath="energia"
                onAtualizado={carregarMedidas}
              />
            </Card>
          )}
        </div>
      )}

      {aba === 'configuracoes' && (
        <div className="space-y-4">
          <Card title="Cota de Consumo de Água">
            <p className="mb-4 text-sm text-gray-500">
              Define o limite diário de consumo de água (m³). O valor aparece como linha de referência no gráfico da página de Água.
            </p>
            <FormCota cotaAtual={cotaAtual} onAtualizado={setCotaAtual} />
            {cotaAtual && (
              <p className="mt-3 text-sm text-gray-600">
                Cota atual: <span className="font-semibold">{cotaAtual.toFixed(2)} m³/dia</span>
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
