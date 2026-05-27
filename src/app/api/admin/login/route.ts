import { NextRequest, NextResponse } from 'next/server'
import { createToken, TOKEN_COOKIE } from '@/lib/auth'
import { verificarSenhaAdmin, ensureSeedUser } from '@/services/adminUserService'
import { criarLog } from '@/services/logService'

export async function POST(request: NextRequest) {
  try {
    await ensureSeedUser()
    const { usuario, senha } = await request.json()

    const resultado = await verificarSenhaAdmin(usuario, senha)
    if (!resultado.ok) {
      return NextResponse.json({ erro: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const token = await createToken(usuario.toLowerCase(), resultado.userId, resultado.nome)
    const response = NextResponse.json({ sucesso: true })

    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    })

    await criarLog(usuario.toLowerCase(), 'login_admin', `Login administrativo: ${resultado.nome}`)
    return response
  } catch {
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
