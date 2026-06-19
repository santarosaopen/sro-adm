'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Atividade, ExecucaoAtividade } from '@/types'
import { formatarDataHora } from '@/lib/formatters'

const QR_PREFIX = 'SRO-ATIV:'

interface Props {
  atividades: Atividade[]
  onEditar: (a: Atividade) => void
  onDeletar: (id: string) => void
  onToggleAtivo: (a: Atividade) => void
}

// ── Impressão ─────────────────────────────────────────────────────────────────

async function imprimirQRCodes(lista: Atividade[]) {
  const QRCode = await import('qrcode')

  const itens = await Promise.all(
    lista.map(async (a) => ({
      nome: a.nome,
      funcao: typeof a.funcaoId === 'object' ? a.funcaoId.nome : '',
      qrUrl: await QRCode.toDataURL(`${QR_PREFIX}${a.qrToken}`, {
        width: 200,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }),
    }))
  )

  // Agrupa em páginas de 9 (grid 3×3)
  const paginas: typeof itens[] = []
  for (let i = 0; i < itens.length; i += 9) paginas.push(itens.slice(i, i + 9))

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QR Codes — Atividades</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: Arial, sans-serif; background: #fff; }
    .pagina {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6mm;
      page-break-after: always;
    }
    .pagina:last-child { page-break-after: avoid; }
    .card {
      border: 2px solid #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 6px;
      aspect-ratio: 1 / 1;
      overflow: hidden;
    }
    .card img {
      width: 130px;
      height: 130px;
      flex-shrink: 0;
    }
    .card .nome {
      margin-top: 6px;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      line-height: 1.3;
      word-break: break-word;
      max-width: 100%;
    }
    .card .funcao {
      margin-top: 2px;
      font-size: 8px;
      color: #444;
      text-align: center;
    }
  </style>
</head>
<body>
  ${paginas
    .map(
      (pg) => `
  <div class="pagina">
    ${pg
      .map(
        (item) => `
    <div class="card">
      <img src="${item.qrUrl}" alt="QR" />
      <p class="nome">${item.nome}</p>
      ${item.funcao ? `<p class="funcao">${item.funcao}</p>` : ''}
    </div>`
      )
      .join('')}
  </div>`
    )
    .join('')}
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) { alert('Permita pop-ups para imprimir.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

// ── Modal QR individual ───────────────────────────────────────────────────────

function QRModal({ atividade, onFechar }: { atividade: Atividade; onFechar: () => void }) {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    import('qrcode').then((QRCode) =>
      QRCode.toDataURL(`${QR_PREFIX}${atividade.qrToken}`, { width: 256, margin: 2 })
        .then(setQrUrl)
    )
  }, [atividade.qrToken])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onFechar}>
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
        <p className="mb-1 font-bold text-gray-900">{atividade.nome}</p>
        <p className="mb-4 text-xs text-gray-500">{typeof atividade.funcaoId === 'object' ? atividade.funcaoId.nome : ''}</p>
        {qrUrl
          ? <img src={qrUrl} alt="QR Code" className="mx-auto" /> // eslint-disable-line @next/next/no-img-element
          : <div className="mx-auto h-64 w-64 animate-pulse rounded-xl bg-gray-100" />}
        <div className="mt-4 flex gap-2">
          <Button onClick={() => imprimirQRCodes([atividade])} variant="secondary" className="flex-1 justify-center text-xs">
            Imprimir
          </Button>
          <Button onClick={onFechar} variant="secondary" className="flex-1 justify-center text-xs">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Modal execuções ───────────────────────────────────────────────────────────

function ExecucoesModal({ atividade, onFechar }: { atividade: Atividade; onFechar: () => void }) {
  const [execucoes, setExecucoes] = useState<ExecucaoAtividade[]>([])
  const [loading, setLoading] = useState(true)
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/execucoes?atividadeId=${atividade._id}`)
      .then((r) => r.json())
      .then((d) => setExecucoes(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [atividade._id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onFechar}>
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{atividade.nome}</p>
            <p className="text-xs text-gray-500">Histórico de execuções</p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="overflow-y-auto space-y-3 flex-1">
          {loading && <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>}
          {!loading && execucoes.length === 0 && <div className="py-8 text-center text-sm text-gray-400">Nenhuma execução registrada.</div>}
          {!loading && execucoes.map((ex) => {
            const func = ex.funcionarioId && typeof ex.funcionarioId === 'object' ? ex.funcionarioId : null
            return (
              <div key={ex._id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{func?.nome ?? '—'}</p>
                  <p className="text-xs text-gray-400">{formatarDataHora(ex.timestamp)}</p>
                </div>
                {ex.fotos.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {ex.fotos.map((f, i) => (
                      <button key={i} onClick={() => setFotoAmpliada(f)}>
                        <img src={f} alt={`foto ${i + 1}`} className="h-14 w-14 rounded-lg object-cover border border-gray-200 hover:opacity-80" /> {/* eslint-disable-line @next/next/no-img-element */}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {fotoAmpliada && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setFotoAmpliada(null)}>
          <img src={fotoAmpliada} alt="foto" className="max-w-sm w-full rounded-2xl" /> {/* eslint-disable-line @next/next/no-img-element */}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ListaAtividades({ atividades, onEditar, onDeletar, onToggleAtivo }: Props) {
  const router = useRouter()
  const [qrModal, setQrModal] = useState<Atividade | null>(null)
  const execucoesModal = null // mantém compatibilidade — navegação agora é por rota
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [gerando, setGerando] = useState(false)

  const todasIds = atividades.map((a) => a._id!)
  const todasMarcadas = todasIds.length > 0 && todasIds.every((id) => selecionadas.has(id))
  const algumaMarcada = selecionadas.size > 0

  function toggleTodas() {
    setSelecionadas(todasMarcadas ? new Set() : new Set(todasIds))
  }

  function toggleUma(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleImprimir(lista: Atividade[]) {
    setGerando(true)
    try { await imprimirQRCodes(lista) }
    finally { setGerando(false) }
  }

  if (!atividades.length) {
    return <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">Nenhuma atividade cadastrada.</p>
  }

  const listaSelecionadas = atividades.filter((a) => selecionadas.has(a._id!))

  return (
    <>
      {/* Barra de ações de impressão */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={gerando}
          disabled={gerando}
          onClick={() => handleImprimir(atividades)}
        >
          Imprimir todas ({atividades.length})
        </Button>
        <Button
          size="sm"
          variant="secondary"
          loading={gerando}
          disabled={!algumaMarcada || gerando}
          onClick={() => handleImprimir(listaSelecionadas)}
        >
          Imprimir selecionadas {algumaMarcada ? `(${selecionadas.size})` : ''}
        </Button>
        {algumaMarcada && (
          <button
            onClick={() => setSelecionadas(new Set())}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Limpar seleção
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={todasMarcadas}
                  onChange={toggleTodas}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Atividade</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Função</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {atividades.map((a) => {
              const marcada = selecionadas.has(a._id!)
              return (
                <tr key={a._id} className={`transition-colors ${marcada ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => toggleUma(a._id!)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.nome}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {typeof a.funcaoId === 'object' ? a.funcaoId.nome : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggleAtivo(a)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${a.ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {a.ativo ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Button size="sm" variant="ghost" onClick={() => setQrModal(a)}>QR</Button>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/atividades/${a._id}`)}>Execuções</Button>
                      <Button size="sm" variant="ghost" onClick={() => onEditar(a)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => { if (confirm(`Deletar "${a.nome}"?`)) onDeletar(a._id!) }}>Deletar</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {qrModal && <QRModal atividade={qrModal} onFechar={() => setQrModal(null)} />}
      {/* Execuções agora têm página dedicada: /admin/atividades/[id] */}
    </>
  )
}
