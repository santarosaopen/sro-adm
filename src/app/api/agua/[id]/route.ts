import { NextRequest, NextResponse } from 'next/server'
import { deletarLeitura } from '@/services/aguaService'

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
