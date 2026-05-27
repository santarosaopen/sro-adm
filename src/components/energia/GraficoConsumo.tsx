'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { agruparPorSemana, agruparPorMes, agruparPorAno } from '@/lib/graficos'
import { LeituraEnergia } from '@/types'

type Periodo = 'semana' | 'mes' | 'ano'

interface Props {
  leituras: LeituraEnergia[]
}

const periodos: { key: Periodo; label: string }[] = [
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'ano', label: 'Ano' },
]

export default function GraficoConsumo({ leituras }: Props) {
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
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit=" kWh" />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(2)} kWh`, 'Consumo']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Area type="monotone" dataKey="valor" stroke="#f59e0b" strokeWidth={2} fill="url(#colorEnergia)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
