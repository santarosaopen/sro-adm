import { NextRequest, NextResponse } from 'next/server'
import { listarFuncionarios, criarFuncionario } from '@/services/funcionarioService'

export async function GET(request: NextRequest) {
  try {
    const apenasAtivos = request.nextUrl.searchParams.get('ativos') === 'true'
    const funcionarios = await listarFuncionarios(apenasAtivos)
    return NextResponse.json(funcionarios)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar funcionários' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json()
    const funcionario = await criarFuncionario(corpo)
    return NextResponse.json(funcionario, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar funcionário' }, { status: 500 })
  }
}
