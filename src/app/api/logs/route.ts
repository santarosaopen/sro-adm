import { NextRequest, NextResponse } from 'next/server'
import { listarLogs } from '@/services/logService'
import { extrairAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const logs = await listarLogs(200)
    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar logs' }, { status: 500 })
  }
}
