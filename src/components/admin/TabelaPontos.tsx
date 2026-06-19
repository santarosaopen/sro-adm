'use client'

import { RegistroPonto } from '@/types'
import { formatarDataHora } from '@/lib/formatters'
import Button from '@/components/ui/Button'

interface Props {
  registros: RegistroPonto[]
  onDeletar: (id: string) => void
}

function nomeFuncionario(registro: RegistroPonto): string {
  if (typeof registro.funcionarioId === 'object' && registro.funcionarioId !== null) {
    return registro.funcionarioId.nome
  }
  return 'Desconhecido'
}

function nomeFuncao(registro: RegistroPonto): string {
  if (typeof registro.funcaoId === 'object' && registro.funcaoId !== null) {
    return registro.funcaoId.nome
  }
  return '—'
}

export default function TabelaPontos({ registros, onDeletar }: Props) {
  if (!registros.length) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Nenhum registro de presença encontrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Funcionário</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Função</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Data/Hora</th>
            <th className="px-4 py-3 text-center font-medium text-gray-700">Foto</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{nomeFuncionario(r)}</td>
              <td className="px-4 py-3 text-gray-600">{nomeFuncao(r)}</td>
              <td className="px-4 py-3 text-gray-600">{formatarDataHora(r.timestamp)}</td>
              <td className="px-4 py-3 text-center">
                {r.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.foto}
                    alt="Foto do registro"
                    className="mx-auto h-10 w-14 rounded object-cover"
                  />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('Deletar este registro de presença?')) onDeletar(r._id!)
                  }}
                >
                  Deletar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
