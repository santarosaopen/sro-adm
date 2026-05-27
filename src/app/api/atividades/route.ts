import { NextRequest, NextResponse } from 'next/server'
import { buscarRegistro, salvarRegistro } from '@/services/atividadeService'

export async function GET(request: NextRequest) {
  try {
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId')
    const data = request.nextUrl.searchParams.get('data')

    if (!funcionarioId || !data) {
      return NextResponse.json({ erro: 'Parâmetros funcionarioId e data são obrigatórios' }, { status: 400 })
    }

    const registro = await buscarRegistro(funcionarioId, data)
    return NextResponse.json(registro || null)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar atividades' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()
    const registro = await salvarRegistro(corpo)
    return NextResponse.json(registro, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar atividades' }, { status: 500 })
  }
}
