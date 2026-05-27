import { LeituraAgua } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'

interface Props {
  leituras: LeituraAgua[]
  cota?: number
}

export default function EstatisticasConsumo({ leituras, cota }: Props) {
  const diarias = leituras.filter((l) => l.tipo === 'diaria' && l.valor > 0)

  if (!diarias.length) {
    return (
      <p className="text-sm text-gray-500">Nenhuma leitura diária registrada ainda.</p>
    )
  }

  const ordenado = [...diarias].sort((a, b) => b.valor - a.valor)
  const maximo = ordenado[0]
  const minimo = ordenado[ordenado.length - 1]
  const media = diarias.reduce((s, l) => s + l.valor, 0) / diarias.length
  const acimaDaCota = cota ? diarias.filter((l) => l.valor > cota).length : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Maior consumo"
        value={`${formatarNumero(maximo.valor)} m³`}
        sub={formatarData(maximo.data)}
        color="text-red-600"
        bg="bg-red-50"
      />
      <StatCard
        label="Menor consumo"
        value={`${formatarNumero(minimo.valor)} m³`}
        sub={formatarData(minimo.data)}
        color="text-green-600"
        bg="bg-green-50"
      />
      <StatCard
        label="Média diária"
        value={`${formatarNumero(media)} m³`}
        sub={`${diarias.length} leituras`}
        color="text-blue-600"
        bg="bg-blue-50"
      />
      {cota && cota > 0 ? (
        <StatCard
          label="Acima da cota"
          value={`${acimaDaCota} dias`}
          sub={`Cota: ${formatarNumero(cota)} m³`}
          color={acimaDaCota > 0 ? 'text-orange-600' : 'text-green-600'}
          bg={acimaDaCota > 0 ? 'bg-orange-50' : 'bg-green-50'}
        />
      ) : (
        <StatCard label="Total" value={`${formatarNumero(diarias.reduce((s, l) => s + l.valor, 0))} m³`} sub="acumulado" color="text-gray-700" bg="bg-gray-50" />
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color, bg }: { label: string; value: string; sub: string; color: string; bg: string }) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
