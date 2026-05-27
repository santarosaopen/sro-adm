import { NextRequest, NextResponse } from 'next/server'
import { createToken, validateAdminCredentials, TOKEN_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { usuario, senha } = await request.json()

    if (!validateAdminCredentials(usuario, senha)) {
      return NextResponse.json({ erro: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const token = await createToken()
    const response = NextResponse.json({ sucesso: true })

    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
