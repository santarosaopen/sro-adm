import { NextRequest, NextResponse } from 'next/server'
import { buscarAtividadePorToken } from '@/services/atividadeService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('t')
    if (!token) return NextResponse.json({ erro: 'Token obrigatório' }, { status: 400 })
    const atividade = await buscarAtividadePorToken(token)
    if (!atividade) return NextResponse.json({ erro: 'Atividade não encontrada ou inativa' }, { status: 404 })
    return NextResponse.json(atividade)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar atividade' }, { status: 500 })
  }
}
