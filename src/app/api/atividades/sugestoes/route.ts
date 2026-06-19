import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AtividadeModel from '@/models/Atividade'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'

export const dynamic = 'force-dynamic'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Dado o hoje (Date no fuso local) e a periodicidade, diz se a atividade deve ser sugerida
function deveSugerir(
  periodicidade: { tipo: string; intervalo?: number; diasSemana?: number[] },
  ultimaExecucao: Date | null,
  hoje: Date
): boolean {
  if (periodicidade.tipo === 'intervalo') {
    const dias = periodicidade.intervalo ?? 1
    if (!ultimaExecucao) return true
    const proxima = new Date(ultimaExecucao)
    proxima.setDate(proxima.getDate() + dias)
    proxima.setHours(0, 0, 0, 0)
    const hojeInicio = new Date(hoje)
    hojeInicio.setHours(0, 0, 0, 0)
    return proxima <= hojeInicio
  }

  if (periodicidade.tipo === 'diasSemana') {
    const dias = periodicidade.diasSemana ?? []
    if (!dias.length) return false
    const diaSemanaHoje = hoje.getDay() // 0=dom
    if (!dias.includes(diaSemanaHoje)) return false
    if (!ultimaExecucao) return true
    // Verifica se a última execução foi antes de hoje (não executada hoje ainda)
    const ultimaInicio = new Date(ultimaExecucao)
    ultimaInicio.setHours(0, 0, 0, 0)
    const hojeInicio = new Date(hoje)
    hojeInicio.setHours(0, 0, 0, 0)
    return ultimaInicio < hojeInicio
  }

  return false
}

// Texto legível da periodicidade
function descricaoPeriodicidade(p: { tipo: string; intervalo?: number; diasSemana?: number[] }): string {
  if (p.tipo === 'intervalo') {
    const n = p.intervalo ?? 1
    return n === 1 ? 'Diária' : `A cada ${n} dias`
  }
  if (p.tipo === 'diasSemana') {
    const nomes = (p.diasSemana ?? []).sort().map((d) => DIAS_SEMANA[d])
    return nomes.join(', ')
  }
  return ''
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const funcaoId = request.nextUrl.searchParams.get('funcaoId')
    const funcionarioId = request.nextUrl.searchParams.get('funcionarioId')

    if (!funcaoId) return NextResponse.json({ erro: 'funcaoId obrigatório' }, { status: 400 })

    // Atividades da função com periodicidade definida
    const atividades = await AtividadeModel.find({
      funcaoId,
      ativo: true,
      periodicidade: { $exists: true, $ne: null },
    }).lean()

    if (!atividades.length) return NextResponse.json([])

    // Última execução de cada atividade (por este funcionário, se informado)
    const hoje = new Date()

    const sugestoes = await Promise.all(
      atividades.map(async (ativ) => {
        const filtroUltima: Record<string, unknown> = { atividadeId: ativ._id }
        if (funcionarioId) filtroUltima.funcionarioId = funcionarioId

        const ultima = await ExecucaoAtividadeModel.findOne(filtroUltima)
          .sort({ timestamp: -1 })
          .select('timestamp')
          .lean()

        const deve = deveSugerir(
          ativ.periodicidade as { tipo: string; intervalo?: number; diasSemana?: number[] },
          ultima ? (ultima.timestamp as Date) : null,
          hoje
        )

        if (!deve) return null

        return {
          _id: String(ativ._id),
          nome: ativ.nome,
          qrToken: ativ.qrToken,
          periodicidade: descricaoPeriodicidade(
            ativ.periodicidade as { tipo: string; intervalo?: number; diasSemana?: number[] }
          ),
          ultimaExecucao: ultima ? ultima.timestamp : null,
        }
      })
    )

    return NextResponse.json(sugestoes.filter(Boolean))
  } catch (err) {
    console.error('[sugestoes]', err)
    return NextResponse.json({ erro: 'Erro ao buscar sugestões' }, { status: 500 })
  }
}
