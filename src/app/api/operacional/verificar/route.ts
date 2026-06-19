import { NextRequest, NextResponse } from 'next/server'
import { verificarSenhaOperacional } from '@/services/adminUserService'
import { verificarCredencialFuncionario } from '@/services/funcionarioService'
import { criarLog } from '@/services/logService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username, senha } = await request.json()
    if (!username || !senha) return NextResponse.json({ ok: false })

    // Tenta funcionário primeiro
    const func = await verificarCredencialFuncionario(username, senha)
    if (func.ok) {
      await criarLog(username, 'modo_operacional', `Modo operacional habilitado: ${func.nome} (funcionário)`)
      return NextResponse.json({ ok: true, nome: func.nome, funcionarioId: func.funcionarioId, tipo: 'funcionario' })
    }

    // Fallback: usuário admin com senha operacional
    const admin = await verificarSenhaOperacional(username, senha)
    if (admin.ok) {
      await criarLog(username, 'modo_operacional', `Modo operacional habilitado: ${admin.nome}`)
      return NextResponse.json({ ok: true, nome: admin.nome, tipo: 'admin' })
    }

    return NextResponse.json({ ok: false })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
