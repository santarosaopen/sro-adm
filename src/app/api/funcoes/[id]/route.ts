import { NextRequest, NextResponse } from 'next/server'
import { buscarFuncaoPorId, atualizarFuncao, deletarFuncao } from '@/services/funcaoService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const funcao = await buscarFuncaoPorId(id)
    if (!funcao) return NextResponse.json({ erro: 'Função não encontrada' }, { status: 404 })
    return NextResponse.json(funcao)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar função' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await extrairAdmin(request)
  try {
    const { id } = await params
    const corpo = await request.json()
    const funcao = await atualizarFuncao(id, corpo)
    await criarLog(admin?.username ?? 'sistema', 'editar_funcao', `Função editada: ${id}`)
    return NextResponse.json(funcao)
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar função' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await extrairAdmin(request)
  try {
    const { id } = await params
    await deletarFuncao(id)
    await criarLog(admin?.username ?? 'sistema', 'deletar_funcao', `Função deletada: ${id}`)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao deletar função' }, { status: 500 })
  }
}
