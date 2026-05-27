'use client'

import { useEffect, useState, useCallback } from 'react'
import Card from '@/components/ui/Card'
import FormMedicao from '@/components/agua/FormMedicao'
import GraficoConsumo from '@/components/agua/GraficoConsumo'
import EstatisticasConsumo from '@/components/agua/EstatisticasConsumo'
import FormCota from '@/components/agua/FormCota'
import BotaoExportarPDF from '@/components/agua/BotaoExportarPDF'
import { LeituraAgua } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'
import Button from '@/components/ui/Button'

export default function PaginaAgua() {
  const [leituras, setLeituras] = useState<LeituraAgua[]>([])
  const [cota, setCota] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  const carregarDados = useCallback(async () => {
    const [leiturasRes, cotaRes] = await Promise.all([
      fetch('/api/agua').then((r) => r.json()),
      fetch('/api/configuracao?chave=cota_agua').then((r) => r.json()),
    ])
    setLeituras(Array.isArray(leiturasRes) ? leiturasRes : [])
    if (cotaRes?.valor) setCota(Number(cotaRes.valor))
    setLoading(false)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  async function deletar(id: string) {
    await fetch(`/api/agua/${id}`, { method: 'DELETE' })
    setLeituras((prev) => prev.filter((l) => l._id !== id))
  }

  const mensais = leituras.filter((l) => l.tipo === 'mensal')

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medidas de Água</h1>
          <p className="mt-1 text-sm text-gray-500">Registre e acompanhe o consumo de água</p>
        </div>
        <BotaoExportarPDF leituras={leituras} cota={cota} />
      </div>

      <Card title="Nova Leitura">
        <FormMedicao onSalvo={carregarDados} />
      </Card>

      <Card title="Definir Cota Diária">
        <FormCota cotaAtual={cota} onAtualizado={setCota} />
      </Card>

      <Card title="Estatísticas">
        <EstatisticasConsumo leituras={leituras} cota={cota} />
      </Card>

      <Card title="Gráfico de Consumo (Medições Diárias)">
        <GraficoConsumo leituras={leituras} cota={cota} />
      </Card>

      {mensais.length > 0 && (
        <Card title="Leituras da Companhia (Mensais)">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Valor (m³)</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mensais.map((l) => (
                  <tr key={l._id}>
                    <td className="px-4 py-3">{formatarData(l.data)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatarNumero(l.valor)} m³</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="danger" onClick={() => deletar(l._id!)}>Deletar</Button>
                    </td>
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
