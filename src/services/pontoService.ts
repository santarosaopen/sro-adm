import { connectDB } from '@/lib/mongodb'
import RegistroPontoModel from '@/models/RegistroPonto'

export async function buscarRegistros(funcionarioId?: string) {
  await connectDB()
  const filtro = funcionarioId ? { funcionarioId } : {}
  return RegistroPontoModel.find(filtro)
    .populate('funcionarioId', 'nome')
    .populate('funcaoId', 'nome')
    .sort({ timestamp: -1 })
    .lean()
}

export async function verificarPresencaHoje(funcionarioId: string, funcaoId: string): Promise<boolean> {
  await connectDB()
  const agora = new Date()
  const agoraBrasil = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const ano = agoraBrasil.getUTCFullYear()
  const mes = agoraBrasil.getUTCMonth()
  const dia = agoraBrasil.getUTCDate()
  const hoje = new Date(Date.UTC(ano, mes, dia, 3, 0, 0, 0))
  const amanha = new Date(Date.UTC(ano, mes, dia + 1, 3, 0, 0, 0))

  const count = await RegistroPontoModel.countDocuments({
    funcionarioId,
    funcaoId,
    timestamp: { $gte: hoje, $lt: amanha },
  })
  return count > 0
}

export async function salvarRegistro(dados: {
  funcionarioId: string
  funcaoId: string
  foto: string
  timestamp: string
}) {
  await connectDB()
  return RegistroPontoModel.create({
    ...dados,
    timestamp: new Date(dados.timestamp),
  })
}

export async function deletarRegistro(id: string) {
  await connectDB()
  return RegistroPontoModel.findByIdAndDelete(id)
}
