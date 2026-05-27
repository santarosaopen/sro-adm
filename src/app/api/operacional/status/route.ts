import { NextResponse } from 'next/server'
import { buscarConfig } from '@/services/configuracaoService'

export async function GET() {
  try {
    const hash = await buscarConfig('senha_operacional_hash')
    return NextResponse.json({ configurado: Boolean(hash) })
  } catch {
    return NextResponse.json({ configurado: false })
  }
}
