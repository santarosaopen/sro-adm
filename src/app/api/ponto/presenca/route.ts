import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import RegistroPontoModel from '@/models/RegistroPonto'
import FuncionarioModel from '@/models/Funcionario'

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

    // Todos os registros de hoje, do mais recente para o mais antigo
    const registros = await RegistroPontoModel.find({
      timestamp: { $gte: hoje, $lt: amanha },
    })
      .sort({ timestamp: -1 })
      .lean()

    // Última ocorrência de cada funcionário
    const ultimoPorFuncionario = new Map<string, typeof registros[0]>()
    for (const r of registros) {
      const id = String(r.funcionarioId)
      if (!ultimoPorFuncionario.has(id)) ultimoPorFuncionario.set(id, r)
    }

    // Apenas quem tem último registro = entrada
    const presentes = Array.from(ultimoPorFuncionario.entries())
      .filter(([, r]) => r.tipo === 'entrada')
      .map(([id, r]) => ({ id, foto: r.foto as string, timestamp: r.timestamp }))

    if (!presentes.length) return NextResponse.json([])

    const ids = presentes.map((p) => new Types.ObjectId(p.id))
    const funcionarios = await FuncionarioModel.find({
      _id: { $in: ids },
      ativo: true,
    }).lean()

    const mapa = new Map(funcionarios.map((f) => [String(f._id), f]))

    const resultado = presentes
      .map(({ id, foto, timestamp }) => {
        const f = mapa.get(id)
        if (!f) return null
        return {
          funcionario: { _id: String(f._id), nome: f.nome, cargo: f.cargo },
          foto,
          timestamp,
        }
      })
      .filter(Boolean)

    return NextResponse.json(resultado)
  } catch (err) {
    console.error('[presenca]', err)
    return NextResponse.json({ erro: 'Erro ao buscar presença' }, { status: 500 })
  }
}
