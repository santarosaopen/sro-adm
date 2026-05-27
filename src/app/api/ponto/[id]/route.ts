import { NextRequest, NextResponse } from 'next/server'
import { deletarRegistro } from '@/services/pontoService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await extrairAdmin(request)
  try {
    await deletarRegistro(params.id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_registro_horario', `Registro de horário removido: ${params.id}`)
    return NextResponse.json({ mensagem: 'Registro deletado' })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar registro' }, { status: 500 })
  }
}
