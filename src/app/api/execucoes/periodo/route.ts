import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'
import AtividadeModel from '@/models/Atividade'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const inicio = request.nextUrl.searchParams.get('inicio')
    const fim = request.nextUrl.searchParams.get('fim')
    const funcaoId = request.nextUrl.searchParams.get('funcaoId') || undefined

    if (!inicio || !fim) return NextResponse.json({ erro: 'inicio e fim são obrigatórios' }, { status: 400 })

    const dtInicio = new Date(inicio + 'T00:00:00')
    const dtFim = new Date(fim + 'T23:59:59')

    let atividadeIds: string[] | undefined
    if (funcaoId) {
      const ativs = await AtividadeModel.find({ funcaoId }).select('_id').lean()
      atividadeIds = ativs.map((a) => String(a._id))
    }

    const filtro: Record<string, unknown> = { timestamp: { $gte: dtInicio, $lte: dtFim } }
    if (atividadeIds) filtro.atividadeId = { $in: atividadeIds }

    const execucoes = await ExecucaoAtividadeModel.find(filtro)
      .populate({ path: 'atividadeId', select: 'nome funcaoId', populate: { path: 'funcaoId', select: 'nome' } })
      .populate('funcionarioId', 'nome')
      .sort({ timestamp: -1 })
      .lean()

    return NextResponse.json(execucoes)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar execuções' }, { status: 500 })
  }
}
