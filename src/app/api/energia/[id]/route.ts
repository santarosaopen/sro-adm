import { NextRequest, NextResponse } from 'next/server'
import { deletarLeitura, editarLeitura } from '@/services/energiaService'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const atualizado = await editarLeitura(params.id, body)
    if (!atualizado) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(atualizado)
  } catch {
    return NextResponse.json({ erro: 'Erro ao editar leitura' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletarLeitura(params.id)
    return NextResponse.json({ mensagem: 'Deletado com sucesso' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar leitura' }, { status: 500 })
  }
}
