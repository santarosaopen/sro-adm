import { NextRequest, NextResponse } from 'next/server'
import { buscarAtividadePorId, atualizarAtividade, deletarAtividade } from '@/services/atividadeService'
import { extrairAdmin } from '@/lib/adminAuth'
import { criarLog } from '@/services/logService'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const atividade = await buscarAtividadePorId(id)
    if (!atividade) return NextResponse.json({ erro: 'Atividade não encontrada' }, { status: 404 })
    return NextResponse.json(atividade)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar atividade' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await extrairAdmin(request)
  try {
    const { id } = await params
    const corpo = await request.json()
    const atividade = await atualizarAtividade(id, corpo)
    await criarLog(admin?.username ?? 'sistema', 'editar_atividade', `Atividade editada: ${id}`)
    return NextResponse.json(atividade)
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar atividade' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await extrairAdmin(request)
  try {
    const { id } = await params
    await deletarAtividade(id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_atividade', `Atividade deletada: ${id}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar atividade' }, { status: 500 })
  }
}
