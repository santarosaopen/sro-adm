import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const atividadeId = request.nextUrl.searchParams.get('atividadeId')
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId')

    if (!atividadeId || !funcionarioId) {
      return NextResponse.json({ jaRegistrada: false, execucao: null })
    }

    const agora = new Date()
    const brt = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
    const ano = brt.getUTCFullYear()
    const mes = brt.getUTCMonth()
    const dia = brt.getUTCDate()
    const hoje = new Date(Date.UTC(ano, mes, dia, 3, 0, 0, 0))
    const amanha = new Date(Date.UTC(ano, mes, dia + 1, 3, 0, 0, 0))

    const execucao = await ExecucaoAtividadeModel.findOne({
      atividadeId,
      funcionarioId,
      timestamp: { $gte: hoje, $lt: amanha },
    }).sort({ timestamp: -1 }).lean()

    if (!execucao) return NextResponse.json({ jaRegistrada: false, execucao: null })

    return NextResponse.json({
      jaRegistrada: true,
      execucao: {
        _id: String(execucao._id),
        fotos: execucao.fotos,
        observacao: execucao.observacao ?? '',
      },
    })
  } catch {
    return NextResponse.json({ jaRegistrada: false, execucao: null })
  }
}
