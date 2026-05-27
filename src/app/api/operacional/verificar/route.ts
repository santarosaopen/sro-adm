import { NextRequest, NextResponse } from 'next/server'
import { verificarSenhaOperacional } from '@/services/adminUserService'
import { criarLog } from '@/services/logService'

export async function POST(request: NextRequest) {
  try {
    const { username, senha } = await request.json()
    if (!username || !senha) return NextResponse.json({ ok: false })
    const resultado = await verificarSenhaOperacional(username, senha)
    if (resultado.ok) {
      await criarLog(username, 'modo_operacional', `Modo operacional habilitado: ${resultado.nome}`)
    }
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ ok: false })
  }
}
