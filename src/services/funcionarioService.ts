import { connectDB } from '@/lib/mongodb'
import FuncionarioModel from '@/models/Funcionario'

export async function listarFuncionarios(apenasAtivos = false) {
  await connectDB()
  const filtro = apenasAtivos ? { ativo: true } : {}
  return FuncionarioModel.find(filtro).sort({ nome: 1 }).lean()
}

export async function buscarPorId(id: string) {
  await connectDB()
  return FuncionarioModel.findById(id).lean()
}

export async function criarFuncionario(dados: {
  nome: string
  cargo: string
  atividades: string[]
}) {
  await connectDB()
  return FuncionarioModel.create({ ...dados, ativo: true })
}

export async function atualizarFuncionario(
  id: string,
  dados: Partial<{ nome: string; cargo: string; ativo: boolean; atividades: string[] }>
) {
  await connectDB()
  return FuncionarioModel.findByIdAndUpdate(id, dados, { new: true }).lean()
}

export async function deletarFuncionario(id: string) {
  await connectDB()
  return FuncionarioModel.findByIdAndDelete(id)
}
