import { connectDB } from '@/lib/mongodb'
import LogSistemaModel from '@/models/LogSistema'

export async function criarLog(adminUsername: string, acao: string, descricao: string) {
  try {
    await connectDB()
    await LogSistemaModel.create({ adminUsername, acao, descricao })
  } catch {
    // Logs são fire-and-forget, nunca devem quebrar a operação principal
  }
}

export async function listarLogs(limit = 200) {
  await connectDB()
  return LogSistemaModel.find().sort({ createdAt: -1 }).limit(limit).lean()
}
