import { NextRequest, NextResponse } from 'next/server'
import { listarFuncionarios, criarFuncionario } from '@/services/funcionarioService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

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
  const admin = await extrairAdmin(request)
  try {
    const corpo = await request.json()
    const funcionario = await criarFuncionario(corpo)
    await criarLog(admin?.username ?? 'sistema', 'criar_funcionario', `Funcionário criado: ${corpo.nome}`)
    return NextResponse.json(funcionario, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar funcionário' }, { status: 500 })
  }
}
