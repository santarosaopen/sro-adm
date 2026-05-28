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
import {
  agruparPorSemana,
  agruparPorMes,
  agruparPorAno,
  rotuloPeriodoSemana,
  rotuloPeriodoMes,
  rotuloPeriodoAno,
} from '@/lib/graficos'
import { LeituraAgua } from '@/types'

type Periodo = 'semana' | 'mes' | 'ano'

interface Props {
  leituras: LeituraAgua[]
  cota?: number
  nomeEmpresa?: string
}

const periodos: { key: Periodo; label: string }[] = [
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'ano', label: 'Ano' },
]

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  )
}

function labelParaData(data: Date | string, periodo: Periodo): string {
  const raw = new Date(data)
  const d = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
  if (periodo === 'semana') return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
  if (periodo === 'mes') return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

export default function GraficoConsumo({ leituras, cota, nomeEmpresa }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const [offset, setOffset] = useState(0)

  function mudarPeriodo(p: Periodo) {
    setPeriodo(p)
    setOffset(0)
  }

  // Ordena todas as leituras cronologicamente e calcula deltas entre consecutivas.
  // A leitura da companhia (mensal) serve como baseline sem aparecer como barra.
  const todosOrdenados = [...leituras].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  const deltas = todosOrdenados.slice(1).flatMap((l, i) =>
    l.tipo === 'diaria'
      ? [{ data: l.data, valor: Math.max(0, l.valor - todosOrdenados[i].valor) }]
      : []
  )

  const dados =
    periodo === 'semana'
      ? agruparPorSemana(deltas, offset)
      : periodo === 'mes'
        ? agruparPorMes(deltas, offset)
        : agruparPorAno(deltas, offset)

  const rotulo =
    periodo === 'semana'
      ? rotuloPeriodoSemana(offset)
      : periodo === 'mes'
        ? rotuloPeriodoMes(offset)
        : rotuloPeriodoAno(offset)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {periodos.map((p) => (
            <button
              key={p.key}
              onClick={() => mudarPeriodo(p.key)}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
            title="Período anterior"
          >
            <ChevronIcon dir="left" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-gray-700">
            {rotulo}
          </span>
          <button
            onClick={() => setOffset((o) => o + 1)}
            disabled={offset >= 0}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próximo período"
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
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
            <ReferenceLine
              y={cota}
              stroke="#ef4444"
              strokeDasharray="6 3"
              label={{ value: `Cota: ${cota}`, fill: '#ef4444', fontSize: 11 }}
            />
          )}
          {Array.from(new Set(
            leituras
              .filter((l) => l.tipo === 'mensal')
              .map((l) => labelParaData(l.data, periodo))
          )).map((lbl) => (
            <ReferenceLine
              key={lbl}
              x={lbl}
              stroke="#8b5cf6"
              strokeDasharray="4 2"
              label={{ value: nomeEmpresa || 'Empresa', fill: '#8b5cf6', fontSize: 9, position: 'insideTopLeft' }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
