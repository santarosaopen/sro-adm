import { connectDB } from '@/lib/mongodb'
import RegistroAtividadeModel from '@/models/RegistroAtividade'

function intervaloDia(data: string) {
  const inicio = new Date(data)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(data)
  fim.setHours(23, 59, 59, 999)
  return { $gte: inicio, $lte: fim }
}

export async function buscarRegistro(funcionarioId: string, data: string) {
  await connectDB()
  return RegistroAtividadeModel.findOne({
    funcionarioId,
    data: intervaloDia(data),
  }).lean()
}

export async function salvarRegistro(dados: {
  funcionarioId: string
  data: string
  itens: { nome: string; concluida: boolean }[]
}) {
  await connectDB()
  return RegistroAtividadeModel.findOneAndUpdate(
    { funcionarioId: dados.funcionarioId, data: intervaloDia(dados.data) },
    { ...dados, data: new Date(dados.data) },
    { upsert: true, new: true }
  )
}
