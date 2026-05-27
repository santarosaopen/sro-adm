'use client'

import { useEffect, useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import FormMedicao from '@/components/energia/FormMedicao'
import GraficoConsumo from '@/components/energia/GraficoConsumo'
import CalculadoraEnergia from '@/components/energia/CalculadoraEnergia'
import { LeituraEnergia } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'
import Button from '@/components/ui/Button'
import { useModo } from '@/context/ModoContext'

export default function PaginaEnergia() {
  const [leituras, setLeituras] = useState<LeituraEnergia[]>([])
  const [loading, setLoading] = useState(true)
  const { modo } = useModo()

  const carregarDados = useCallback(async () => {
    const data = await fetch('/api/energia').then((r) => r.json())
    setLeituras(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  async function deletar(id: string) {
    await fetch(`/api/energia/${id}`, { method: 'DELETE' })
    setLeituras((prev) => prev.filter((l) => l._id !== id))
  }

  const diarias = leituras.filter((l) => l.tipo === 'diaria')
  const mensais = leituras.filter((l) => l.tipo === 'mensal')

  const stats = diarias.length
    ? {
        media: diarias.reduce((s, l) => s + l.valor, 0) / diarias.length,
        maximo: [...diarias].sort((a, b) => b.valor - a.valor)[0],
        minimo: [...diarias].sort((a, b) => a.valor - b.valor)[0],
      }
    : null

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

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-xs font-medium text-gray-500">Maior consumo</p>
            <p className="mt-1 text-xl font-bold text-yellow-600">{formatarNumero(stats.maximo.valor)} kWh</p>
            <p className="text-xs text-gray-400">{formatarData(stats.maximo.data)}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-medium text-gray-500">Menor consumo</p>
            <p className="mt-1 text-xl font-bold text-green-600">{formatarNumero(stats.minimo.valor)} kWh</p>
            <p className="text-xs text-gray-400">{formatarData(stats.minimo.data)}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium text-gray-500">Média diária</p>
            <p className="mt-1 text-xl font-bold text-blue-600">{formatarNumero(stats.media)} kWh</p>
            <p className="text-xs text-gray-400">{diarias.length} leituras</p>
          </div>
        </div>
      )}

      <Card title="Gráfico de Consumo">
        <GraficoConsumo leituras={leituras} />
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
