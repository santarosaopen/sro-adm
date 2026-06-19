import { NextRequest, NextResponse } from 'next/server'
import { verificarPresencaHoje } from '@/services/pontoService'

export async function GET(request: NextRequest) {
  try {
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId')
    const funcaoId = request.nextUrl.searchParams.get('funcaoId')
    if (!funcionarioId || !funcaoId) {
      return NextResponse.json({ presente: false })
    }
    const presente = await verificarPresencaHoje(funcionarioId, funcaoId)
    return NextResponse.json({ presente })
  } catch {
    return NextResponse.json({ presente: false })
  }
}
