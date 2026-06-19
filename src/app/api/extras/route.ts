import { NextRequest, NextResponse } from 'next/server'
import { criarAtividadeExtra, listarAtividadesExtras } from '@/services/atividadeExtraService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId') || undefined
    const periodo = request.nextUrl.searchParams.get('periodo') || 'semana'
    const dataInicioParam = request.nextUrl.searchParams.get('inicio')
    const dataFimParam = request.nextUrl.searchParams.get('fim')

    let inicio: Date | undefined
    let fim: Date | undefined

    if (dataInicioParam && dataFimParam) {
      inicio = new Date(dataInicioParam + 'T00:00:00')
      fim = new Date(dataFimParam + 'T23:59:59')
    } else {
      const agora = new Date()
      fim = new Date(agora)
      fim.setHours(23, 59, 59, 999)
      if (periodo === 'dia') {
        inicio = new Date(agora)
        inicio.setHours(0, 0, 0, 0)
      } else if (periodo === 'mes') {
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
      } else {
        // semana
        inicio = new Date(agora)
        inicio.setDate(agora.getDate() - 6)
        inicio.setHours(0, 0, 0, 0)
      }
    }

    const extras = await listarAtividadesExtras({ funcionarioId, inicio, fim })
    return NextResponse.json(extras)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar atividades extras' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()
    if (!corpo.funcionarioId || !corpo.descricao?.trim()) {
      return NextResponse.json({ erro: 'funcionarioId e descricao são obrigatórios' }, { status: 400 })
    }
    if (!Array.isArray(corpo.fotos) || corpo.fotos.length === 0) {
      return NextResponse.json({ erro: 'Ao menos 1 foto é obrigatória' }, { status: 400 })
    }
    const extra = await criarAtividadeExtra(corpo)
    return NextResponse.json(extra, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao registrar atividade extra' }, { status: 500 })
  }
}
