import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'
import AtividadeModel from '@/models/Atividade'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const data = request.nextUrl.searchParams.get('data')
    const funcaoId = request.nextUrl.searchParams.get('funcaoId') || undefined

    if (!data) return NextResponse.json({ erro: 'data é obrigatório' }, { status: 400 })

    const inicio = new Date(data)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(data)
    fim.setHours(23, 59, 59, 999)

    // Se filtro por funcao, busca atividadeIds dessa funcao primeiro
    let atividadeIds: string[] | undefined
    if (funcaoId) {
      const ativs = await AtividadeModel.find({ funcaoId }).select('_id').lean()
      atividadeIds = ativs.map((a) => String(a._id))
    }

    const filtro: Record<string, unknown> = { timestamp: { $gte: inicio, $lte: fim } }
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
