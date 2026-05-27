import { NextRequest, NextResponse } from 'next/server'
import { deletarLeitura, editarLeitura } from '@/services/aguaService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  try {
    const body = await request.json()
    const atualizado = await editarLeitura(params.id, body)
    if (!atualizado) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })
    await criarLog(admin?.username ?? 'sistema', 'editar_leitura_agua', `Leitura de água editada: ${params.id}`)
    return NextResponse.json(atualizado)
  } catch {
    return NextResponse.json({ erro: 'Erro ao editar leitura' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  try {
    await deletarLeitura(params.id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_leitura_agua', `Leitura de água removida: ${params.id}`)
    return NextResponse.json({ mensagem: 'Deletado com sucesso' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar leitura' }, { status: 500 })
  }
}
