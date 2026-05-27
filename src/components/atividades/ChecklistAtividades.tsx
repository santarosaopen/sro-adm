'use client'

import { useState, useEffect, useRef } from 'react'
import { Funcionario, ItemAtividade } from '@/types'

interface ItemLocal extends ItemAtividade {
  custom?: boolean
}

interface Props {
  funcionarioId: string
  data: string
}

export default function ChecklistAtividades({ funcionarioId, data }: Props) {
  const [itens, setItens] = useState<ItemLocal[]>([])
  const [loading, setLoading] = useState(false)
  const [salvandoAuto, setSalvandoAuto] = useState(false)
  const [novaAtividade, setNovaAtividade] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!funcionarioId || !data) return
    setLoading(true)

    Promise.all([
      fetch(`/api/funcionarios/${funcionarioId}`).then((r) => r.json()) as Promise<Funcionario>,
      fetch(`/api/atividades?funcionarioId=${funcionarioId}&data=${data}`).then((r) => r.json()),
    ])
      .then(([funcionario, registro]) => {
        const base: string[] = funcionario.atividades || []
        const mapa = new Map<string, ItemLocal>(base.map((nome) => [nome, { nome, concluida: false }]))

        if (registro?.itens) {
          registro.itens.forEach((item: ItemAtividade) => {
            if (mapa.has(item.nome)) {
              mapa.get(item.nome)!.concluida = item.concluida
            } else {
              // atividade customizada salva anteriormente
              mapa.set(item.nome, { nome: item.nome, concluida: item.concluida, custom: true })
            }
          })
        }

        setItens(Array.from(mapa.values()))
      })
      .finally(() => setLoading(false))
  }, [funcionarioId, data])

  function salvarImediatamente(novosItens: ItemLocal[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSalvandoAuto(true)
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/atividades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            funcionarioId,
            data,
            itens: novosItens.map(({ nome, concluida }) => ({ nome, concluida })),
          }),
        })
      } finally {
        setSalvandoAuto(false)
      }
    }, 300)
  }

  function toggleItem(index: number) {
    setItens((prev) => {
      const novo = prev.map((item, i) =>
        i === index ? { ...item, concluida: !item.concluida } : item
      )
      salvarImediatamente(novo)
      return novo
    })
  }

  function adicionarAtividade() {
    const nome = novaAtividade.trim()
    if (!nome) return
    if (itens.some((i) => i.nome.toLowerCase() === nome.toLowerCase())) {
      setNovaAtividade('')
      return
    }

    setItens((prev) => {
      const novo = [...prev, { nome, concluida: true, custom: true }]
      salvarImediatamente(novo)
      return novo
    })
    setNovaAtividade('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') adicionarAtividade()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  const concluidas = itens.filter((i) => i.concluida).length
  const total = itens.length

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-sm text-gray-500">
            {concluidas} de {total} concluída{total !== 1 ? 's' : ''}
          </p>
          <div className="h-2 flex-1 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${total ? (concluidas / total) * 100 : 0}%` }}
            />
          </div>
          {salvandoAuto && (
            <span className="shrink-0 text-xs text-gray-400">Salvando...</span>
          )}
        </div>
      )}

      {itens.length > 0 && (
        <ul className="space-y-2">
          {itens.map((item, i) => (
            <li key={item.nome}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  item.concluida
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.concluida}
                  onChange={() => toggleItem(i)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.concluida ? 'text-green-700 line-through' : 'text-gray-700'
                  }`}
                >
                  {item.nome}
                </span>
                {item.custom && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
                    extra
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">Registrar atividade extra do dia</p>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Descreva a atividade realizada..."
            value={novaAtividade}
            onChange={(e) => setNovaAtividade(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={120}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={adicionarAtividade}
            disabled={!novaAtividade.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {!itens.length && (
        <p className="text-sm text-gray-500">
          Este funcionário não possui atividades cadastradas. Use o campo acima para registrar uma atividade extra ou acesse o Admin para adicionar atividades padrão.
        </p>
      )}
    </div>
  )
}
