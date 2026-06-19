import { NextRequest, NextResponse } from 'next/server'
import { extrairAdmin } from '@/lib/adminAuth'
import { deletarExecucao } from '@/services/execucaoService'
import { criarLog } from '@/services/logService'
import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const corpo = await request.json()
    const execucao = await ExecucaoAtividadeModel.findByIdAndUpdate(
      id,
      { fotos: corpo.fotos, observacao: corpo.observacao ?? '' },
      { new: true }
    ).lean()
    if (!execucao) return NextResponse.json({ erro: 'Execução não encontrada' }, { status: 404 })
    return NextResponse.json(execucao)
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar execução' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await extrairAdmin(request)
  try {
    const { id } = await params
    await deletarExecucao(id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_execucao', `Execução removida: ${id}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar execução' }, { status: 500 })
  }
}
