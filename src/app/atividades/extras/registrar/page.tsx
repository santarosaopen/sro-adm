'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CapturaFotos from '@/components/ui/CapturaFotos'
import { useModo } from '@/context/ModoContext'

export default function PaginaRegistrarExtra() {
  const router = useRouter()
  const { funcionarioLogado } = useModo()
  const [descricao, setDescricao] = useState('')
  const [observacao, setObservacao] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  async function registrar() {
    if (!descricao.trim()) { setErro('Descreva a atividade realizada.'); return }
    if (fotos.length === 0) { setErro('Tire ao menos 1 foto.'); return }
    if (!funcionarioLogado) { setErro('Você precisa estar logado como funcionário.'); return }
    setSalvando(true); setErro('')
    try {
      const res = await fetch('/api/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionarioId: funcionarioLogado.id,
          descricao: descricao.trim(),
          observacao: observacao.trim(),
          fotos,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.erro ?? 'Erro') }
      setSucesso(true)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao registrar.')
    } finally { setSalvando(false) }
  }

  if (sucesso) return (
    <div className="flex flex-col items-center space-y-6 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Atividade extra registrada!</h2>
        <p className="mt-1 text-sm text-gray-500">{descricao}</p>
      </div>
      <Button onClick={() => { setDescricao(''); setObservacao(''); setFotos([]); setSucesso(false) }}>Registrar outra</Button>
      <button onClick={() => router.push('/atividades')} className="text-sm text-gray-400 hover:text-gray-600">Voltar ao início</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">← Voltar</button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registrar Atividade Extra</h1>
          <p className="text-xs text-gray-500">Atividade não prevista na função</p>
        </div>
      </div>

      {funcionarioLogado && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <span className="text-xs font-medium text-blue-600">Registrando como:</span>
          <span className="text-xs font-semibold text-blue-800">{funcionarioLogado.nome}</span>
        </div>
      )}

      <Card title="Descrição da atividade">
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva a atividade extra realizada..."
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{descricao.length}/500</p>
      </Card>

      <Card title="Observação (opcional)">
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Alguma observação adicional..."
          rows={2}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{observacao.length}/500</p>
      </Card>

      <Card title="Fotos">
        <CapturaFotos fotos={fotos} onChange={setFotos} obrigatorio />
      </Card>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <Button
        onClick={registrar}
        loading={salvando}
        disabled={!descricao.trim() || fotos.length === 0}
        className="w-full justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-200"
      >
        Confirmar atividade extra
      </Button>
    </div>
  )
}
