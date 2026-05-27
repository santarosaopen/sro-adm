import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import RegistroPontoModel from '@/models/RegistroPonto'
import FuncionarioModel from '@/models/Funcionario'

export async function GET() {
  try {
    await connectDB()

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

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
    const presentesIds = Array.from(ultimoPorFuncionario.entries())
      .filter(([, r]) => r.tipo === 'entrada')
      .map(([id, r]) => ({ id, foto: r.foto, timestamp: r.timestamp }))

    if (!presentesIds.length) return NextResponse.json([])

    const funcionarios = await FuncionarioModel.find({
      _id: { $in: presentesIds.map((p) => p.id) },
      ativo: true,
    }).lean()

    const mapa = new Map(funcionarios.map((f) => [String(f._id), f]))

    const resultado = presentesIds
      .map(({ id, foto, timestamp }) => {
        const f = mapa.get(id)
        if (!f) return null
        return { funcionario: { _id: String(f._id), nome: f.nome, cargo: f.cargo }, foto, timestamp }
      })
      .filter(Boolean)

    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar presença' }, { status: 500 })
  }
}
