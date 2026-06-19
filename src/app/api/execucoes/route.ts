import { NextRequest, NextResponse } from 'next/server'
import { criarExecucao, listarExecucoes } from '@/services/execucaoService'

export async function GET(request: NextRequest) {
  try {
    const atividadeId = request.nextUrl.searchParams.get('atividadeId') || undefined
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId') || undefined
    const execucoes = await listarExecucoes(atividadeId, funcionarioId)
    return NextResponse.json(execucoes)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar execuções' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()
    if (!corpo.atividadeId || !corpo.funcionarioId || !Array.isArray(corpo.fotos) || corpo.fotos.length === 0) {
      return NextResponse.json({ erro: 'atividadeId, funcionarioId e ao menos 1 foto são obrigatórios' }, { status: 400 })
    }
    const execucao = await criarExecucao(corpo)
    return NextResponse.json(execucao, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao registrar execução' }, { status: 500 })
  }
}
