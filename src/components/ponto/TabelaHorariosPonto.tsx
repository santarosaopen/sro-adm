'use client'

import { RegistroPonto } from '@/types'
import { formatarHora } from '@/lib/formatters'

interface DiaAgrupado {
  dataLabel: string
  dataObj: Date
  entradas: RegistroPonto[]
  saidas: RegistroPonto[]
}

function agruparPorDia(registros: RegistroPonto[]): DiaAgrupado[] {
  const mapa: Record<string, DiaAgrupado> = {}

  registros.forEach((r) => {
    const d = new Date(r.timestamp)
    const chave = d.toLocaleDateString('pt-BR')
    if (!mapa[chave]) {
      mapa[chave] = {
        dataLabel: d.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        dataObj: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        entradas: [],
        saidas: [],
      }
    }
    if (r.tipo === 'entrada') mapa[chave].entradas.push(r)
    else mapa[chave].saidas.push(r)
  })

  return Object.values(mapa).sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime())
}

interface Props {
  registros: RegistroPonto[]
}

export default function TabelaHorariosPonto({ registros }: Props) {
  if (!registros.length) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Nenhum registro encontrado para este funcionário.
      </p>
    )
  }

  const dias = agruparPorDia(registros)
  const diasIncompletos = dias.filter((d) => d.entradas.length === 0 || d.saidas.length === 0)

  return (
    <div className="space-y-4">
      {diasIncompletos.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            ⚠️ {diasIncompletos.length} dia{diasIncompletos.length > 1 ? 's' : ''} com registro incompleto:
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-red-600">
            {diasIncompletos.map((d) => (
              <li key={d.dataLabel}>
                • {d.dataLabel} —{' '}
                {d.entradas.length === 0 && d.saidas.length === 0
                  ? 'sem entrada e sem saída'
                  : d.entradas.length === 0
                    ? 'sem entrada registrada'
                    : 'sem saída registrada'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Entrada</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Saída</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dias.map((dia) => {
              const semEntrada = dia.entradas.length === 0
              const semSaida = dia.saidas.length === 0
              const incompleto = semEntrada || semSaida

              return (
                <tr key={dia.dataLabel} className={incompleto ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                    {dia.dataLabel}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {dia.entradas.length > 0 ? (
                      <div className="space-y-0.5">
                        {dia.entradas.map((r) => (
                          <div key={r._id} className="font-semibold text-green-700">
                            {formatarHora(r.timestamp)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-red-500">Não registrado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {dia.saidas.length > 0 ? (
                      <div className="space-y-0.5">
                        {dia.saidas.map((r) => (
                          <div key={r._id} className="font-semibold text-orange-600">
                            {formatarHora(r.timestamp)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-red-500">Não registrado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {incompleto ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        ⚠️{' '}
                        {semEntrada && semSaida
                          ? 'Sem registros'
                          : semEntrada
                            ? 'Sem entrada'
                            : 'Sem saída'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        ✓ Completo
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
