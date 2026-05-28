import { LeituraEnergia } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'

interface Props {
  leituras: LeituraEnergia[]
}

export default function EstatisticasConsumo({ leituras }: Props) {
  // Ordena todas as leituras cronologicamente; leitura da companhia serve como baseline
  const todosOrdenados = [...leituras]
    .filter((l) => l.valor > 0)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  const deltas = todosOrdenados.slice(1).flatMap((l, i) =>
    l.tipo === 'diaria'
      ? [{ data: l.data, delta: Math.max(0, l.valor - todosOrdenados[i].valor) }]
      : []
  )

  const diarias = leituras.filter((l) => l.tipo === 'diaria' && l.valor > 0)

  if (deltas.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        São necessárias ao menos 2 leituras para calcular estatísticas de consumo.
      </p>
    )
  }

  const maiorDelta = deltas.reduce((max, d) => (d.delta > max.delta ? d : max), deltas[0])
  const menorDelta = deltas.reduce((min, d) => (d.delta < min.delta ? d : min), deltas[0])

  // Média diária baseada no range das últimas 2 leituras da companhia
  const mensais = leituras
    .filter((l) => l.tipo === 'mensal')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  let mediaLabel = ''
  let mediaDiaria: number | null = null

  if (mensais.length >= 2) {
    const compAnterior = mensais[mensais.length - 2]
    const compRecente = mensais[mensais.length - 1]
    const diariasEntre = diarias.filter(
      (l) =>
        new Date(l.data) >= new Date(compAnterior.data) &&
        new Date(l.data) <= new Date(compRecente.data)
    )
    if (diariasEntre.length >= 2) {
      const deltasEntre = diariasEntre.slice(1).map((l, i) => ({
        delta: Math.max(0, l.valor - diariasEntre[i].valor),
      }))
      mediaDiaria = deltasEntre.reduce((s, d) => s + d.delta, 0) / deltasEntre.length
    } else {
      const diasEntre =
        (new Date(compRecente.data).getTime() - new Date(compAnterior.data).getTime()) /
        (1000 * 60 * 60 * 24)
      mediaDiaria = diasEntre > 0 ? (compRecente.valor - compAnterior.valor) / diasEntre : null
    }
    mediaLabel = `${formatarData(compAnterior.data)} – ${formatarData(compRecente.data)}`
  } else if (mensais.length === 1) {
    const comp = mensais[0]
    const diariasApos = diarias.filter((l) => new Date(l.data) >= new Date(comp.data))
    if (diariasApos.length >= 2) {
      const deltasApos = diariasApos.slice(1).map((l, i) => ({
        delta: Math.max(0, l.valor - diariasApos[i].valor),
      }))
      mediaDiaria = deltasApos.reduce((s, d) => s + d.delta, 0) / deltasApos.length
      mediaLabel = `desde ${formatarData(comp.data)}`
    }
  } else {
    mediaDiaria = deltas.reduce((s, d) => s + d.delta, 0) / deltas.length
    mediaLabel = 'todas as leituras'
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Maior consumo diário"
        value={`${formatarNumero(maiorDelta.delta)} kWh`}
        sub={formatarData(maiorDelta.data)}
        color="text-yellow-600"
        bg="bg-yellow-50"
      />
      <StatCard
        label="Menor consumo diário"
        value={`${formatarNumero(menorDelta.delta)} kWh`}
        sub={formatarData(menorDelta.data)}
        color="text-green-600"
        bg="bg-green-50"
      />
      <StatCard
        label="Média diária"
        value={mediaDiaria !== null ? `${formatarNumero(mediaDiaria)} kWh` : '—'}
        sub={mediaLabel || `${deltas.length} intervalos`}
        color="text-blue-600"
        bg="bg-blue-50"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
  bg,
}: {
  label: string
  value: string
  sub: string
  color: string
  bg: string
}) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
