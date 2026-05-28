import { LeituraAgua } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'

interface Props {
  leituras: LeituraAgua[]
  cota?: number
}

export default function ConsumoCotas({ leituras, cota }: Props) {
  const diarias = leituras.filter((l) => l.tipo === 'diaria')
  const mensais = leituras.filter((l) => l.tipo === 'mensal')

  const ultimaCompanhia = [...mensais]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]

  const ultimaDiaria = [...diarias]
    .filter((l) => !ultimaCompanhia || new Date(l.data) >= new Date(ultimaCompanhia.data))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]

  if (!ultimaCompanhia) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
        <p className="text-sm font-medium text-orange-700">Nenhuma leitura da companhia registrada.</p>
        <p className="mt-1 text-xs text-orange-600">
          Registre uma leitura mensal (da companhia) para acompanhar o consumo em relação à cota.
        </p>
      </div>
    )
  }

  const consumido = ultimaDiaria
    ? Math.max(0, ultimaDiaria.valor - ultimaCompanhia.valor)
    : 0

  const percentual = cota && cota > 0 ? Math.min(100, (consumido / cota) * 100) : null
  const disponivel = cota ? Math.max(0, cota - consumido) : null

  const corBarra =
    percentual === null ? 'bg-blue-500'
    : percentual >= 90 ? 'bg-red-500'
    : percentual >= 70 ? 'bg-orange-500'
    : 'bg-green-500'

  const corConsumo =
    percentual === null ? 'text-blue-700'
    : percentual >= 90 ? 'text-red-700'
    : percentual >= 70 ? 'text-orange-700'
    : 'text-green-700'

  const bgConsumo =
    percentual === null ? 'bg-blue-50'
    : percentual >= 90 ? 'bg-red-50'
    : percentual >= 70 ? 'bg-orange-50'
    : 'bg-green-50'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[140px] flex-1 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">Leitura da companhia</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatarNumero(ultimaCompanhia.valor)} m³</p>
          <p className="mt-0.5 text-xs text-gray-400">{formatarData(ultimaCompanhia.data)}</p>
        </div>

        <div className="min-w-[140px] flex-1 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">Leitura atual</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {ultimaDiaria ? `${formatarNumero(ultimaDiaria.valor)} m³` : '—'}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {ultimaDiaria ? formatarData(ultimaDiaria.data) : 'Sem leitura após companhia'}
          </p>
        </div>

        <div className={`min-w-[140px] flex-1 rounded-xl p-4 ${bgConsumo}`}>
          <p className="text-xs font-medium text-gray-500">Consumido</p>
          <p className={`mt-1 text-xl font-bold ${corConsumo}`}>{formatarNumero(consumido)} m³</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {cota ? `de ${formatarNumero(cota)} m³` : 'sem cota definida'}
          </p>
        </div>

        {disponivel !== null && (
          <div className={`min-w-[140px] flex-1 rounded-xl p-4 ${disponivel <= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-xs font-medium text-gray-500">Disponível</p>
            <p className={`mt-1 text-xl font-bold ${disponivel <= 0 ? 'text-red-700' : 'text-green-700'}`}>
              {disponivel <= 0 ? '0,00' : formatarNumero(disponivel)} m³
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {disponivel <= 0 ? 'Cota esgotada' : 'restante da cota'}
            </p>
          </div>
        )}
      </div>

      {percentual !== null && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Consumo do período</span>
            <span className={`font-medium ${corConsumo}`}>{percentual.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${corBarra}`}
              style={{ width: `${Math.min(100, percentual)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
