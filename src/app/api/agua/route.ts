import { NextRequest, NextResponse } from 'next/server'
import { buscarLeituras, salvarLeitura } from '@/services/aguaService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const tipo = request.nextUrl.searchParams.get('tipo') || undefined
    const leituras = await buscarLeituras(tipo)
    return NextResponse.json(leituras)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar leituras de água' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()
    const leitura = await salvarLeitura(corpo)
    return NextResponse.json(leitura, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar leitura de água' }, { status: 500 })
  }
}
