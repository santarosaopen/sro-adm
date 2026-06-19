import { NextRequest, NextResponse } from 'next/server'
import { listarFuncoes, criarFuncao } from '@/services/funcaoService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apenasAtivas = request.nextUrl.searchParams.get('ativas') === 'true'
    const funcoes = await listarFuncoes(apenasAtivas)
    return NextResponse.json(funcoes)
  } catch {
    return NextResponse.json({ erro: 'Erro ao listar funções' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await extrairAdmin(request)
  try {
    const corpo = await request.json()
    const funcao = await criarFuncao(corpo)
    await criarLog(admin?.username ?? 'sistema', 'criar_funcao', `Função criada: ${corpo.nome}`)
    return NextResponse.json(funcao, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar função' }, { status: 500 })
  }
}
