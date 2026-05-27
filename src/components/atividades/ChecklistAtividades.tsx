'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Funcionario, ItemAtividade } from '@/types'

interface Props {
  funcionarioId: string
  data: string
}

export default function ChecklistAtividades({ funcionarioId, data }: Props) {
  const [itens, setItens] = useState<ItemAtividade[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!funcionarioId || !data) return
    setLoading(true)

    Promise.all([
      fetch(`/api/funcionarios/${funcionarioId}`).then((r) => r.json()) as Promise<Funcionario>,
      fetch(`/api/atividades?funcionarioId=${funcionarioId}&data=${data}`).then((r) => r.json()),
    ])
      .then(([funcionario, registro]) => {
        const atividadesBase = funcionario.atividades || []
        const concluidasMap: Record<string, boolean> = {}

        if (registro?.itens) {
          registro.itens.forEach((item: ItemAtividade) => {
            concluidasMap[item.nome] = item.concluida
          })
        }

        setItens(
          atividadesBase.map((nome: string) => ({
            nome,
            concluida: concluidasMap[nome] ?? false,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [funcionarioId, data])

  function toggleItem(index: number) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, concluida: !item.concluida } : item))
    )
  }

  async function handleSalvar() {
    setSalvando(true)
    try {
      await fetch('/api/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId, data, itens }),
      })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } finally {
      setSalvando(false)
    }
  }

  if (!funcionarioId) {
    return <p className="text-sm text-gray-500">Selecione um funcionário para ver as atividades.</p>
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}</div>
  }

  if (!itens.length) {
    return <p className="text-sm text-gray-500">Este funcionário não possui atividades cadastradas. Acesse o Admin para adicionar.</p>
  }

  const concluidas = itens.filter((i) => i.concluida).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{concluidas} de {itens.length} concluídas</p>
        <div className="h-2 flex-1 mx-4 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${itens.length ? (concluidas / itens.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {itens.map((item, i) => (
          <li key={i}>
            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${item.concluida ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input
                type="checkbox"
                checked={item.concluida}
                onChange={() => toggleItem(i)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${item.concluida ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                {item.nome}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Button onClick={handleSalvar} loading={salvando}>
          Salvar Atividades
        </Button>
        {sucesso && <span className="text-sm text-green-600">Salvo com sucesso!</span>}
      </div>
    </div>
  )
}
