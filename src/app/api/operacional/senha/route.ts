import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { jwtVerify } from 'jose'
import { salvarConfig } from '@/services/configuracaoService'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function POST(request: NextRequest) {
  // Requer autenticação admin
  const token = request.cookies.get('admin-token')?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    await jwtVerify(token, SECRET)
  } catch {
    return NextResponse.json({ erro: 'Token inválido' }, { status: 401 })
  }

  try {
    const { senha } = await request.json()
    if (!senha || String(senha).length < 4) {
      return NextResponse.json({ erro: 'Senha deve ter no mínimo 4 caracteres' }, { status: 400 })
    }
    const hash = createHash('sha256').update(String(senha)).digest('hex')
    await salvarConfig('senha_operacional_hash', hash)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar senha' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    await jwtVerify(token, SECRET)
  } catch {
    return NextResponse.json({ erro: 'Token inválido' }, { status: 401 })
  }

  try {
    await salvarConfig('senha_operacional_hash', '')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao remover senha' }, { status: 500 })
  }
}
