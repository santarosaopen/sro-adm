import { NextRequest, NextResponse } from 'next/server'
import { deletarRegistro } from '@/services/pontoService'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletarRegistro(params.id)
    return NextResponse.json({ mensagem: 'Registro deletado' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar registro' }, { status: 500 })
  }
}
