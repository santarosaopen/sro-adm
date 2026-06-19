import { createHash } from 'crypto'
import { connectDB } from '@/lib/mongodb'
import FuncionarioModel from '@/models/Funcionario'

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export async function listarFuncionarios(apenasAtivos = false) {
  await connectDB()
  const filtro = apenasAtivos ? { ativo: { $ne: false } } : {}
  return FuncionarioModel.find(filtro)
    .select('-senhaHash')
    .sort({ nome: 1 })
    .lean()
}

export async function buscarPorId(id: string) {
  await connectDB()
  return FuncionarioModel.findById(id).select('-senhaHash').lean()
}

export async function criarFuncionario(dados: { nome: string; username?: string; senha?: string }) {
  await connectDB()
  return FuncionarioModel.create({
    nome: dados.nome,
    username: dados.username?.toLowerCase().trim() ?? '',
    senhaHash: dados.senha ? sha256(dados.senha) : '',
    ativo: true,
  })
}

export async function atualizarFuncionario(
  id: string,
  dados: Partial<{ nome: string; username: string; senha: string; ativo: boolean }>
) {
  await connectDB()
  const update: Record<string, unknown> = {}
  if (dados.nome !== undefined) update.nome = dados.nome
  if (dados.ativo !== undefined) update.ativo = dados.ativo
  if (dados.username !== undefined) update.username = dados.username.toLowerCase().trim()
  if (dados.senha !== undefined) update.senhaHash = dados.senha ? sha256(dados.senha) : ''
  return FuncionarioModel.findByIdAndUpdate(id, update, { new: true }).select('-senhaHash').lean()
}

export async function deletarFuncionario(id: string) {
  await connectDB()
  return FuncionarioModel.findByIdAndDelete(id)
}

export async function verificarCredencialFuncionario(
  username: string,
  senha: string
): Promise<{ ok: boolean; funcionarioId: string; nome: string }> {
  await connectDB()
  const f = await FuncionarioModel.findOne({
    username: username.toLowerCase().trim(),
    ativo: true,
  }).lean()
  if (!f || !f.senhaHash) return { ok: false, funcionarioId: '', nome: '' }
  return {
    ok: f.senhaHash === sha256(senha),
    funcionarioId: String(f._id),
    nome: f.nome,
  }
}
