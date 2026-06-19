'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { formatarData, formatarNumero } from '@/lib/formatters'

interface Leitura {
  _id?: string
  valor: number
  data: string
  tipo: 'diaria' | 'mensal'
}

interface Props {
  leituras: Leitura[]
  unidade: string
  apiPath: string
  onAtualizado: () => void
}

interface LeituraEditando {
  id: string
  valor: string
  data: string
}

export default function TabelaLeituras({ leituras, unidade, apiPath, onAtualizado }: Props) {
  const [editando, setEditando] = useState<LeituraEditando | null>(null)
  const [salvando, setSalvando] = useState(false)

  function iniciarEdicao(l: Leitura) {
    setEditando({
      id: l._id!,
      valor: String(l.valor),
      data: new Date(l.data).toISOString().split('T')[0],
    })
  }

  function cancelar() {
    setEditando(null)
  }

  async function salvar() {
    if (!editando) return
    const valor = parseFloat(editando.valor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) return

    setSalvando(true)
    try {
      await fetch(`/api/${apiPath}/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor, data: editando.data }),
      })
      setEditando(null)
      onAtualizado()
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id: string) {
    await fetch(`/api/${apiPath}/${id}`, { method: 'DELETE' })
    onAtualizado()
  }

  if (!leituras.length) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Nenhuma leitura registrada.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
            <th className="px-4 py-3 text-left font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Valor ({unidade})</th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leituras.map((l) => {
            const emEdicao = editando?.id === l._id

            return (
              <tr key={l._id} className={emEdicao ? 'bg-blue-50' : ''}>
                <td className="px-4 py-3">
                  {emEdicao && editando ? (
                    <input
                      type="date"
                      value={editando.data}
                      onChange={(e) => setEditando({ ...editando, data: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    formatarData(l.data)
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {l.tipo === 'diaria' ? 'Diária' : 'Mensal'}
                </td>
                <td className="px-4 py-3 text-right">
                  {emEdicao && editando ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editando.valor}
                      onChange={(e) => setEditando({ ...editando, valor: e.target.value })}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="font-medium">{formatarNumero(l.valor)} {unidade}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {emEdicao ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" loading={salvando} onClick={salvar}>Salvar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelar}>Cancelar</Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => iniciarEdicao(l)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => deletar(l._id!)}>Deletar</Button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
