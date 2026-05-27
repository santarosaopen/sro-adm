'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { agruparPorSemana, agruparPorMes, agruparPorAno } from '@/lib/graficos'
import { LeituraAgua } from '@/types'

type Periodo = 'semana' | 'mes' | 'ano'

interface Props {
  leituras: LeituraAgua[]
  cota?: number
}

const periodos: { key: Periodo; label: string }[] = [
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'ano', label: 'Ano' },
]

export default function GraficoConsumo({ leituras, cota }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('semana')

  const diarias = leituras.filter((l) => l.tipo === 'diaria')

  const dados =
    periodo === 'semana'
      ? agruparPorSemana(diarias)
      : periodo === 'mes'
        ? agruparPorMes(diarias)
        : agruparPorAno(diarias)

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {periodos.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              periodo === p.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit=" m³" />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(2)} m³`, 'Consumo']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          {cota && cota > 0 && (
            <ReferenceLine y={cota} stroke="#ef4444" strokeDasharray="6 3" label={{ value: `Cota: ${cota}`, fill: '#ef4444', fontSize: 11 }} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
