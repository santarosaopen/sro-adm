import { connectDB } from '@/lib/mongodb'
import RegistroPontoModel from '@/models/RegistroPonto'

export async function buscarRegistros(funcionarioId?: string) {
  await connectDB()
  const filtro = funcionarioId ? { funcionarioId } : {}
  return RegistroPontoModel.find(filtro)
    .populate('funcionarioId', 'nome cargo')
    .sort({ timestamp: -1 })
    .lean()
}

export async function salvarRegistro(dados: {
  funcionarioId: string
  tipo: 'entrada' | 'saida'
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
