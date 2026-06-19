'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Atividade, Funcao, Periodicidade } from '@/types'

const DIAS = [
  { idx: 1, label: 'Seg' },
  { idx: 2, label: 'Ter' },
  { idx: 3, label: 'Qua' },
  { idx: 4, label: 'Qui' },
  { idx: 5, label: 'Sex' },
  { idx: 6, label: 'Sáb' },
  { idx: 0, label: 'Dom' },
]

interface Props {
  atividade?: Atividade | null
  funcaoIdInicial?: string
  onSalvo: () => void
  onCancelar: () => void
}

export default function FormAtividade({ atividade, funcaoIdInicial, onSalvo, onCancelar }: Props) {
  const [nome, setNome] = useState('')
  const [funcaoId, setFuncaoId] = useState('')
  const [funcaoNome, setFuncaoNome] = useState('')
  const [usarPeriodicidade, setUsarPeriodicidade] = useState(false)
  const [tipoPeriodicidade, setTipoPeriodicidade] = useState<'intervalo' | 'diasSemana'>('intervalo')
  const [intervalo, setIntervalo] = useState(1)
  const [diasSemana, setDiasSemana] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (atividade) {
      setNome(atividade.nome)
      const fid = typeof atividade.funcaoId === 'object' ? atividade.funcaoId._id : atividade.funcaoId
      const fnome = typeof atividade.funcaoId === 'object' ? atividade.funcaoId.nome : ''
      setFuncaoId(fid)
      setFuncaoNome(fnome)
      const p = atividade.periodicidade
      if (p) {
        setUsarPeriodicidade(true)
        setTipoPeriodicidade(p.tipo)
        setIntervalo(p.intervalo ?? 1)
        setDiasSemana(p.diasSemana ?? [])
      } else {
        setUsarPeriodicidade(false)
        setTipoPeriodicidade('intervalo')
        setIntervalo(1)
        setDiasSemana([])
      }
    } else {
      setNome('')
      setFuncaoId(funcaoIdInicial ?? '')
      setUsarPeriodicidade(false)
      setTipoPeriodicidade('intervalo')
      setIntervalo(1)
      setDiasSemana([])
      if (funcaoIdInicial) {
        fetch(`/api/funcoes/${funcaoIdInicial}`)
          .then((r) => r.json())
          .then((f: Funcao) => setFuncaoNome(f.nome ?? ''))
          .catch(() => setFuncaoNome(''))
      } else {
        setFuncaoNome('')
      }
    }
  }, [atividade, funcaoIdInicial])

  function toggleDia(idx: number) {
    setDiasSemana((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
  }

  function montarPeriodicidade(): Periodicidade | undefined {
    if (!usarPeriodicidade) return undefined
    if (tipoPeriodicidade === 'intervalo') {
      return { tipo: 'intervalo', intervalo: Math.max(1, intervalo) }
    }
    return { tipo: 'diasSemana', diasSemana }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) { setErro('Nome é obrigatório'); return }
    if (!funcaoId) { setErro('Selecione uma função no filtro antes de cadastrar'); return }
    if (usarPeriodicidade && tipoPeriodicidade === 'diasSemana' && diasSemana.length === 0) {
      setErro('Selecione ao menos um dia da semana')
      return
    }
    setLoading(true)
    try {
      const url = atividade ? `/api/atividades/${atividade._id}` : '/api/atividades'
      const method = atividade ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), funcaoId, periodicidade: montarPeriodicidade() ?? null }),
      })
      if (!res.ok) throw new Error()
      onSalvo()
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Função (só leitura) */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-500">Função:</span>
        <span className="text-sm font-medium text-gray-800">{funcaoNome || '—'}</span>
      </div>

      {/* Nome */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome da Atividade</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Verificar nível do tanque..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      {/* Periodicidade */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={usarPeriodicidade}
            onChange={(e) => setUsarPeriodicidade(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Definir sugestão de periodicidade</span>
        </label>

        {usarPeriodicidade && (
          <div className="space-y-4 pl-7">
            {/* Tipo */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoPeriodicidade('intervalo')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tipoPeriodicidade === 'intervalo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Intervalo de dias
              </button>
              <button
                type="button"
                onClick={() => setTipoPeriodicidade('diasSemana')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tipoPeriodicidade === 'diasSemana' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Dias da semana
              </button>
            </div>

            {/* Intervalo */}
            {tipoPeriodicidade === 'intervalo' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">A cada</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={intervalo}
                  onChange={(e) => setIntervalo(Number(e.target.value))}
                  className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">dia{intervalo !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Dias da semana */}
            {tipoPeriodicidade === 'diasSemana' && (
              <div>
                <p className="mb-2 text-xs text-gray-500">Selecione os dias em que a atividade deve ser realizada:</p>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((d) => (
                    <button
                      key={d.idx}
                      type="button"
                      onClick={() => toggleDia(d.idx)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${diasSemana.includes(d.idx) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400">
              A atividade será sugerida no modo operacional quando estiver dentro da periodicidade e ainda não tiver sido realizada.
            </p>
          </div>
        )}
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {atividade ? 'Atualizar' : 'Criar'} Atividade
        </Button>
        <Button type="button" variant="secondary" onClick={onCancelar}>Cancelar</Button>
      </div>
    </form>
  )
}
