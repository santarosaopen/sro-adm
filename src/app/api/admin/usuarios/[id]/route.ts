import { NextRequest, NextResponse } from 'next/server'
import { editarAdminUser, deletarAdminUser } from '@/services/adminUserService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const corpo = await request.json()
    const atualizado = await editarAdminUser(params.id, corpo)
    if (!atualizado) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

    const campos: string[] = []
    if (corpo.nome) campos.push('nome')
    if (corpo.senha) campos.push('senha admin')
    if (corpo.senhaOperacional !== undefined) campos.push('senha operacional')
    if (corpo.ativo !== undefined) campos.push(corpo.ativo ? 'ativado' : 'desativado')

    await criarLog(admin.username, 'editar_admin', `Usuário editado (${campos.join(', ')}): ${params.id}`)
    return NextResponse.json(atualizado)
  } catch {
    return NextResponse.json({ erro: 'Erro ao editar usuário' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    await deletarAdminUser(params.id)
    await criarLog(admin.username, 'deletar_admin', `Usuário administrativo removido: ${params.id}`)
    return NextResponse.json({ mensagem: 'Removido' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao remover usuário' }, { status: 500 })
  }
}
