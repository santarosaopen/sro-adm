import { NextRequest, NextResponse } from 'next/server'
import { buscarPorId, atualizarFuncionario, deletarFuncionario } from '@/services/funcionarioService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const funcionario = await buscarPorId(params.id)
    if (!funcionario) return NextResponse.json({ erro: 'Funcionário não encontrado' }, { status: 404 })
    return NextResponse.json(funcionario)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar funcionário' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  try {
    const corpo = await request.json()
    const funcionario = await atualizarFuncionario(params.id, corpo)
    await criarLog(admin?.username ?? 'sistema', 'editar_funcionario', `Funcionário editado: ${params.id}`)
    return NextResponse.json(funcionario)
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar funcionário' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  try {
    await deletarFuncionario(params.id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_funcionario', `Funcionário removido: ${params.id}`)
    return NextResponse.json({ mensagem: 'Funcionário deletado' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar funcionário' }, { status: 500 })
  }
}
