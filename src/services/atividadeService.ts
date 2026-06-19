import { randomUUID } from 'crypto'
import { connectDB } from '@/lib/mongodb'
import AtividadeModel from '@/models/Atividade'
import type { IPeriodicidade } from '@/models/Atividade'

export async function listarAtividades(funcaoId?: string) {
  await connectDB()
  const filtro = funcaoId ? { funcaoId } : {}
  return AtividadeModel.find(filtro)
    .populate('funcaoId', 'nome')
    .sort({ nome: 1 })
    .lean()
}

export async function listarAtividadesPorFuncao(funcaoId: string) {
  await connectDB()
  return AtividadeModel.find({ funcaoId, ativo: true })
    .populate('funcaoId', 'nome')
    .sort({ nome: 1 })
    .lean()
}

export async function buscarAtividadePorId(id: string) {
  await connectDB()
  return AtividadeModel.findById(id).populate('funcaoId', 'nome').lean()
}

export async function buscarAtividadePorToken(token: string) {
  await connectDB()
  return AtividadeModel.findOne({ qrToken: token, ativo: true })
    .populate('funcaoId', 'nome')
    .lean()
}

export async function criarAtividade(dados: {
  nome: string
  funcaoId: string
  periodicidade?: IPeriodicidade
}) {
  await connectDB()
  return AtividadeModel.create({
    nome: dados.nome,
    funcaoId: dados.funcaoId,
    qrToken: randomUUID(),
    ativo: true,
    periodicidade: dados.periodicidade ?? undefined,
  })
}

export async function atualizarAtividade(
  id: string,
  dados: Partial<{ nome: string; ativo: boolean; periodicidade: IPeriodicidade | null }>
) {
  await connectDB()
  const update: Record<string, unknown> = {}
  if (dados.nome !== undefined) update.nome = dados.nome
  if (dados.ativo !== undefined) update.ativo = dados.ativo
  if ('periodicidade' in dados) {
    update.periodicidade = dados.periodicidade ?? undefined
  }
  return AtividadeModel.findByIdAndUpdate(id, update, { new: true })
    .populate('funcaoId', 'nome')
    .lean()
}

export async function deletarAtividade(id: string) {
  await connectDB()
  return AtividadeModel.findByIdAndDelete(id)
}
