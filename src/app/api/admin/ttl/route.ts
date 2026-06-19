import { NextRequest, NextResponse } from 'next/server'
import { extrairAdmin } from '@/lib/adminAuth'
import { connectDB } from '@/lib/mongodb'
import { syncTTLIndexes } from '@/lib/ttl'

export async function POST(request: NextRequest) {
  const admin = await extrairAdmin(request)
  if (!admin) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const conn = await connectDB()
    await syncTTLIndexes(conn)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao sincronizar TTL' }, { status: 500 })
  }
}
