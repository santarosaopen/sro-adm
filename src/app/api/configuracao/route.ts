import { NextRequest, NextResponse } from 'next/server'
import { buscarConfig, salvarConfig } from '@/services/configuracaoService'
import { criarLog } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const chave = request.nextUrl.searchParams.get('chave')
    if (!chave) return NextResponse.json({ erro: 'Parâmetro chave é obrigatório' }, { status: 400 })
    const valor = await buscarConfig(chave)
    return NextResponse.json({ chave, valor })
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar configuração' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await extrairAdmin(request)
  try {
    const { chave, valor } = await request.json()
    const config = await salvarConfig(chave, valor)
    await criarLog(
      admin?.username ?? 'sistema',
      'alterar_configuracao',
      `Configuração alterada: ${chave} = ${valor}`
    )
    return NextResponse.json(config, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao salvar configuração' }, { status: 500 })
  }
}
