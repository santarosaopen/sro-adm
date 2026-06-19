import { connectDB } from '@/lib/mongodb'
import AtividadeExtraModel from '@/models/AtividadeExtra'

export async function criarAtividadeExtra(dados: {
  funcionarioId: string
  descricao: string
  observacao?: string
  fotos: string[]
}) {
  await connectDB()
  return AtividadeExtraModel.create({ ...dados, timestamp: new Date() })
}

export async function listarAtividadesExtras(opts: {
  funcionarioId?: string
  inicio?: Date
  fim?: Date
}) {
  await connectDB()
  const filtro: Record<string, unknown> = {}
  if (opts.funcionarioId) filtro.funcionarioId = opts.funcionarioId
  if (opts.inicio || opts.fim) {
    filtro.timestamp = {}
    if (opts.inicio) (filtro.timestamp as Record<string, Date>).$gte = opts.inicio
    if (opts.fim) (filtro.timestamp as Record<string, Date>).$lte = opts.fim
  }
  return AtividadeExtraModel.find(filtro)
    .populate('funcionarioId', 'nome')
    .sort({ timestamp: -1 })
    .lean()
}
