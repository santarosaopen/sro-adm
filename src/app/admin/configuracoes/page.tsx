'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FormCota from '@/components/agua/FormCota'
import FormGPS from '@/components/admin/FormGPS'
import FormNomeEmpresa from '@/components/admin/FormNomeEmpresa'

export default function PaginaConfiguracoes() {
  const router = useRouter()
  const [cotaAtual, setCotaAtual] = useState<number | undefined>()
  const [nomeAgua, setNomeAgua] = useState('')
  const [nomeEnergia, setNomeEnergia] = useState('')
  const [retencaoPresencas, setRetencaoPresencas] = useState('30')
  const [retencaoExecucoes, setRetencaoExecucoes] = useState('90')
  const [salvandoRetencao, setSalvandoRetencao] = useState(false)
  const [msgRetencao, setMsgRetencao] = useState('')

  const carregar = useCallback(async () => {
    const [cota, agua, energia, pres, exec] = await Promise.all([
      fetch('/api/configuracao?chave=cota_agua').then((r) => r.json()),
      fetch('/api/configuracao?chave=nome_empresa_agua').then((r) => r.json()),
      fetch('/api/configuracao?chave=nome_empresa_energia').then((r) => r.json()),
      fetch('/api/configuracao?chave=retencao_presencas_dias').then((r) => r.json()),
      fetch('/api/configuracao?chave=retencao_execucoes_dias').then((r) => r.json()),
    ])
    if (cota?.valor) setCotaAtual(Number(cota.valor))
    if (agua?.valor) setNomeAgua(agua.valor)
    if (energia?.valor) setNomeEnergia(energia.valor)
    if (pres?.valor) setRetencaoPresencas(String(pres.valor))
    if (exec?.valor) setRetencaoExecucoes(String(exec.valor))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function salvarRetencao() {
    setSalvandoRetencao(true); setMsgRetencao('')
    try {
      await Promise.all([
        fetch('/api/configuracao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chave: 'retencao_presencas_dias', valor: Number(retencaoPresencas) }) }),
        fetch('/api/configuracao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chave: 'retencao_execucoes_dias', valor: Number(retencaoExecucoes) }) }),
      ])
      await fetch('/api/admin/ttl', { method: 'POST' })
      setMsgRetencao('Retenção atualizada com sucesso.')
    } catch {
      setMsgRetencao('Erro ao salvar retenção.')
    } finally { setSalvandoRetencao(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">←</button>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
      </div>

      <Card title="Cota de Consumo de Água">
        <p className="mb-4 text-sm text-gray-500">Define o limite diário de consumo de água (m³).</p>
        <FormCota cotaAtual={cotaAtual} onAtualizado={setCotaAtual} />
        {cotaAtual && <p className="mt-3 text-sm text-gray-600">Atual: <span className="font-semibold">{cotaAtual.toFixed(2)} m³/dia</span></p>}
      </Card>

      <Card title="Nome da Companhia de Água">
        <FormNomeEmpresa chave="nome_empresa_agua" nomeAtual={nomeAgua} onAtualizado={setNomeAgua} />
      </Card>

      <Card title="Nome da Companhia de Energia">
        <FormNomeEmpresa chave="nome_empresa_energia" nomeAtual={nomeEnergia} onAtualizado={setNomeEnergia} />
      </Card>

      <Card title="Localização de Referência (GPS)">
        <p className="mb-4 text-sm text-gray-500">Define o ponto onde os registros de presença devem ser feitos.</p>
        <FormGPS />
      </Card>

      <Card title="Retenção de Registros">
        <p className="mb-4 text-sm text-gray-500">Dias até o apagamento automático pelo banco de dados.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Presenças (dias)</label>
            <input type="number" min="1" max="365" value={retencaoPresencas} onChange={(e) => setRetencaoPresencas(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <p className="mt-1 text-xs text-gray-400">Padrão: 30 dias</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Execuções de atividades (dias)</label>
            <input type="number" min="1" max="365" value={retencaoExecucoes} onChange={(e) => setRetencaoExecucoes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <p className="mt-1 text-xs text-gray-400">Padrão: 90 dias</p>
          </div>
        </div>
        {msgRetencao && <p className={`mt-3 text-sm ${msgRetencao.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>{msgRetencao}</p>}
        <div className="mt-4"><Button onClick={salvarRetencao} loading={salvandoRetencao}>Salvar retenção</Button></div>
      </Card>
    </div>
  )
}
