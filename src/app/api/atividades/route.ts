import { NextRequest, NextResponse } from 'next/server'
import { listarAtividades, criarAtividade } from '@/services/atividadeService'
import { extrairAdmin } from '@/lib/adminAuth'
import { criarLog } from '@/services/logService'

export async function GET(request: NextRequest) {
  try {
    const funcaoId = request.nextUrl.searchParams.get('funcaoId') || undefined
    const atividades = await listarAtividades(funcaoId)
    return NextResponse.json(atividades)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar atividades' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await extrairAdmin(request)
  try {
    const corpo = await request.json()
    if (!corpo.nome || !corpo.funcaoId) {
      return NextResponse.json({ erro: 'nome e funcaoId são obrigatórios' }, { status: 400 })
    }
    const atividade = await criarAtividade(corpo)
    await criarLog(admin?.username ?? 'sistema', 'criar_atividade', `Atividade criada: ${corpo.nome}`)
    return NextResponse.json(atividade, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar atividade' }, { status: 500 })
  }
}
