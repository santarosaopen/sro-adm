import { NextRequest, NextResponse } from 'next/server'
import { listarAdminUsers, criarAdminUser } from '@/services/adminUserService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const usuarios = await listarAdminUsers()
    return NextResponse.json(usuarios)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar usuários' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const corpo = await request.json()
    if (!corpo.username || !corpo.nome || !corpo.senha) {
      return NextResponse.json({ erro: 'username, nome e senha são obrigatórios' }, { status: 400 })
    }
    const usuario = await criarAdminUser(corpo)
    await criarLog(admin.username, 'criar_admin', `Usuário administrativo criado: ${corpo.username}`)
    return NextResponse.json(usuario, { status: 201 })
  } catch (e: unknown) {
    const msg = (e as { code?: number }).code === 11000 ? 'Username já existe' : 'Erro ao criar usuário'
    return NextResponse.json({ erro: msg }, { status: 400 })
  }
}
