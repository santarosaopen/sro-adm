import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import RegistroPontoModel from '@/models/RegistroPonto'
import FuncionarioModel from '@/models/Funcionario'
import FuncaoModel from '@/models/Funcao'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Usa horário de Brasília (UTC-3) para definir o início/fim do dia
    const agora = new Date()
    const agoraBrasil = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
    const ano = agoraBrasil.getUTCFullYear()
    const mes = agoraBrasil.getUTCMonth()
    const dia = agoraBrasil.getUTCDate()
    // Meia-noite BRT = 03:00 UTC
    const hoje = new Date(Date.UTC(ano, mes, dia, 3, 0, 0, 0))
    const amanha = new Date(Date.UTC(ano, mes, dia + 1, 3, 0, 0, 0))

    // Todos os registros de hoje — cada um já é uma presença (sem tipo)
    const registros = await RegistroPontoModel.find({
      timestamp: { $gte: hoje, $lt: amanha },
    })
      .sort({ timestamp: -1 })
      .lean()

    if (!registros.length) return NextResponse.json([])

    const funcionarioIds = Array.from(new Set(registros.map((r) => String(r.funcionarioId))))
    const funcaoIds = Array.from(new Set(registros.map((r) => String(r.funcaoId))))

    const [funcionarios, funcoes] = await Promise.all([
      FuncionarioModel.find({ _id: { $in: funcionarioIds.map((id) => new Types.ObjectId(id)) }, ativo: true }).lean(),
      FuncaoModel.find({ _id: { $in: funcaoIds.map((id) => new Types.ObjectId(id)) } }).lean(),
    ])

    const mapaFuncionarios = new Map(funcionarios.map((f) => [String(f._id), f]))
    const mapaFuncoes = new Map(funcoes.map((f) => [String(f._id), f]))

    // Um registro por funcionário (o mais recente do dia)
    const vistos = new Set<string>()
    const resultado = []
    for (const r of registros) {
      const fid = String(r.funcionarioId)
      if (vistos.has(fid)) continue
      vistos.add(fid)

      const funcionario = mapaFuncionarios.get(fid)
      const funcao = mapaFuncoes.get(String(r.funcaoId))
      if (!funcionario || !funcao) continue

      resultado.push({
        funcionario: { _id: String(funcionario._id), nome: funcionario.nome },
        funcao: { _id: String(funcao._id), nome: funcao.nome },
        foto: r.foto as string,
        timestamp: r.timestamp,
      })
    }

    return NextResponse.json(resultado)
  } catch (err) {
    console.error('[presenca]', err)
    return NextResponse.json({ erro: 'Erro ao buscar presença' }, { status: 500 })
  }
}
