'use client'

import { Funcao } from '@/types'
import Button from '@/components/ui/Button'

interface Props {
  funcoes: Funcao[]
  onEditar: (funcao: Funcao) => void
  onDeletar: (id: string) => void
  onToggleAtivo: (funcao: Funcao) => void
}

export default function ListaFuncoes({ funcoes, onEditar, onDeletar, onToggleAtivo }: Props) {
  if (!funcoes.length) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Nenhuma função cadastrada ainda.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Nome</th>
            <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {funcoes.map((f) => (
            <tr key={f._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onToggleAtivo(f)}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    f.ativo
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.ativo ? 'Ativa' : 'Inativa'}
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEditar(f)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm(`Deletar a função "${f.nome}"? Esta ação não pode ser desfeita.`)) {
                        onDeletar(f._id!)
                      }
                    }}
                  >
                    Deletar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
