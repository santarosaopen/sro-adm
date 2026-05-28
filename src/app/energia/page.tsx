'use client'

import { useEffect, useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import FormMedicao from '@/components/energia/FormMedicao'
import GraficoConsumo from '@/components/energia/GraficoConsumo'
import EstatisticasConsumo from '@/components/energia/EstatisticasConsumo'
import CalculadoraEnergia from '@/components/energia/CalculadoraEnergia'
import { LeituraEnergia } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'
import Button from '@/components/ui/Button'
import { useModo } from '@/context/ModoContext'

export default function PaginaEnergia() {
  const [leituras, setLeituras] = useState<LeituraEnergia[]>([])
  const [nomeEmpresa, setNomeEmpresa] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { modo } = useModo()

  const carregarDados = useCallback(async () => {
    const [data, nomeRes] = await Promise.all([
      fetch('/api/energia').then((r) => r.json()),
      fetch('/api/configuracao?chave=nome_empresa_energia').then((r) => r.json()),
    ])
    setLeituras(Array.isArray(data) ? data : [])
    if (nomeRes?.valor) setNomeEmpresa(nomeRes.valor)
    setLoading(false)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  async function deletar(id: string) {
    await fetch(`/api/energia/${id}`, { method: 'DELETE' })
    setLeituras((prev) => prev.filter((l) => l._id !== id))
  }

  const mensais = leituras.filter((l) => l.tipo === 'mensal')

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medidas de Energia</h1>
        <p className="mt-1 text-sm text-gray-500">Registre e acompanhe o consumo de energia elétrica</p>
      </div>

      {modo === 'operacional' && (
        <Card title="Nova Leitura">
          <FormMedicao onSalvo={carregarDados} />
        </Card>
      )}

      <Card title="Estatísticas">
        <EstatisticasConsumo leituras={leituras} />
      </Card>

      <Card title="Gráfico de Consumo">
        <GraficoConsumo leituras={leituras} nomeEmpresa={nomeEmpresa} />
      </Card>

      <Card title="Calculadora de Custo Estimado">
        <CalculadoraEnergia />
      </Card>

      {mensais.length > 0 && (
        <Card title="Leituras da Companhia (Mensais)">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Valor (kWh)</th>
                  {modo === 'operacional' && (
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Ação</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mensais.map((l) => (
                  <tr key={l._id}>
                    <td className="px-4 py-3">{formatarData(l.data)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatarNumero(l.valor)} kWh</td>
                    {modo === 'operacional' && (
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="danger" onClick={() => deletar(l._id!)}>Deletar</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
