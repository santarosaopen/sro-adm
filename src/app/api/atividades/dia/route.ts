import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'
import AtividadeExtraModel from '@/models/AtividadeExtra'
import AtividadeModel from '@/models/Atividade'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const data = request.nextUrl.searchParams.get('data')
    const funcaoId = request.nextUrl.searchParams.get('funcaoId') || undefined

    if (!data) return NextResponse.json({ erro: 'data é obrigatório' }, { status: 400 })

    const inicio = new Date(data + 'T00:00:00')
    const fim = new Date(data + 'T23:59:59')
    const intervalo = { $gte: inicio, $lte: fim }

    let atividadeIds: string[] | undefined
    if (funcaoId) {
      const ativs = await AtividadeModel.find({ funcaoId }).select('_id').lean()
      atividadeIds = ativs.map((a) => String(a._id))
    }

    const filtroExec: Record<string, unknown> = { timestamp: intervalo }
    if (atividadeIds) filtroExec.atividadeId = { $in: atividadeIds }

    const [execucoes, extras] = await Promise.all([
      ExecucaoAtividadeModel.find(filtroExec)
        .populate({ path: 'atividadeId', select: 'nome funcaoId', populate: { path: 'funcaoId', select: 'nome _id' } })
        .populate('funcionarioId', 'nome')
        .lean(),
      funcaoId
        ? Promise.resolve([])
        : AtividadeExtraModel.find({ timestamp: intervalo })
          .populate('funcionarioId', 'nome')
          .lean(),
    ])

    type AtivPop = { nome?: string; funcaoId?: { _id: unknown; nome?: string } | null } | null

    const lista = [
      ...execucoes.map((e) => {
        const ativ = e.atividadeId as AtivPop
        const funcao = ativ?.funcaoId
        return {
          _id: String(e._id),
          nome: ativ?.nome ?? '—',
          funcionario: (e.funcionarioId as { nome?: string } | null)?.nome ?? '—',
          funcaoId: funcao ? String(funcao._id) : null,
          funcaoNome: funcao?.nome ?? null,
          fotos: e.fotos as string[],
          timestamp: e.timestamp,
          tipo: 'qr' as const,
        }
      }),
      ...extras.map((e) => ({
        _id: String(e._id),
        nome: e.descricao,
        funcionario: (e.funcionarioId as { nome?: string } | null)?.nome ?? '—',
        funcaoId: null,
        funcaoNome: null,
        fotos: e.fotos as string[],
        timestamp: e.timestamp,
        tipo: 'extra' as const,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(lista)
  } catch (err) {
    console.error('[atividades/dia]', err)
    return NextResponse.json({ erro: 'Erro ao buscar atividades do dia' }, { status: 500 })
  }
}
