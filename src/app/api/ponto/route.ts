import { NextRequest, NextResponse } from 'next/server'
import { buscarRegistros, salvarRegistro } from '@/services/pontoService'

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
    const registro = await salvarRegistro(corpo)
    return NextResponse.json(registro, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar registro de ponto' }, { status: 500 })
  }
}
