import { NextRequest, NextResponse } from 'next/server'
import { buscarRegistros, salvarRegistro, verificarPresencaHoje } from '@/services/pontoService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId') || undefined
    const registros = await buscarRegistros(funcionarioId)
    return NextResponse.json(registros)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar registros de ponto' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()

    if (!corpo.funcionarioId || !corpo.funcaoId || !corpo.foto || !corpo.timestamp) {
      return NextResponse.json({ erro: 'Campos obrigatórios: funcionarioId, funcaoId, foto, timestamp' }, { status: 400 })
    }

    const jaPresente = await verificarPresencaHoje(corpo.funcionarioId, corpo.funcaoId)
    if (jaPresente) {
      return NextResponse.json({ erro: 'Presença já registrada nesta função hoje.' }, { status: 409 })
    }

    const registro = await salvarRegistro(corpo)
    return NextResponse.json(registro, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar registro de ponto' }, { status: 500 })
  }
}
