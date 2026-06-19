import { NextRequest, NextResponse } from 'next/server'
import { extrairAdmin } from '@/lib/adminAuth'
import { criarLog } from '@/services/logService'
import { connectDB } from '@/lib/mongodb'
import AtividadeExtraModel from '@/models/AtividadeExtra'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await extrairAdmin(request)
  try {
    await connectDB()
    const { id } = await params
    await AtividadeExtraModel.findByIdAndDelete(id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_extra', `Atividade extra removida: ${id}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar atividade extra' }, { status: 500 })
  }
}
