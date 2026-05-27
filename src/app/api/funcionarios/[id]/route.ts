import { NextRequest, NextResponse } from 'next/server'
import {
  buscarPorId,
  atualizarFuncionario,
  deletarFuncionario,
} from '@/services/funcionarioService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const funcionario = await buscarPorId(params.id)
    if (!funcionario) {
      return NextResponse.json({ erro: 'Funcionário não encontrado' }, { status: 404 })
    }
    return NextResponse.json(funcionario)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar funcionário' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const corpo = await request.json()
    const funcionario = await atualizarFuncionario(params.id, corpo)
    return NextResponse.json(funcionario)
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar funcionário' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletarFuncionario(params.id)
    return NextResponse.json({ mensagem: 'Funcionário deletado' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar funcionário' }, { status: 500 })
  }
}
