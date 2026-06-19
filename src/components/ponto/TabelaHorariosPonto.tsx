'use client'

import { RegistroPonto } from '@/types'
import { formatarDataHora } from '@/lib/formatters'

interface Props {
  registros: RegistroPonto[]
}

function nomeFuncao(r: RegistroPonto): string {
  if (typeof r.funcaoId === 'object' && r.funcaoId !== null) return r.funcaoId.nome
  return ''
}

export default function TabelaHorariosPonto({ registros }: Props) {
  if (!registros.length) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Nenhum registro encontrado para este funcionário.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Data/Hora</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Função</th>
            <th className="px-4 py-3 text-center font-medium text-gray-700">Foto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {formatarDataHora(r.timestamp)}
              </td>
              <td className="px-4 py-3 text-gray-600">{nomeFuncao(r)}</td>
              <td className="px-4 py-3 text-center">
                {r.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.foto}
                    alt="foto"
                    className="inline-block h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
