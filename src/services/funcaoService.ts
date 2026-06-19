import { connectDB } from '@/lib/mongodb'
import FuncaoModel from '@/models/Funcao'

export async function listarFuncoes(apenasAtivas = false) {
  await connectDB()
  // ativo: { $ne: false } inclui documentos onde o campo não existe ou é true
  const filtro = apenasAtivas ? { ativo: { $ne: false } } : {}
  return FuncaoModel.find(filtro).sort({ nome: 1 }).lean()
}

export async function buscarFuncaoPorId(id: string) {
  await connectDB()
  return FuncaoModel.findById(id).lean()
}

export async function criarFuncao(dados: { nome: string; atividades: string[] }) {
  await connectDB()
  return FuncaoModel.create({ ...dados, ativo: true })
}

export async function atualizarFuncao(
  id: string,
  dados: Partial<{ nome: string; ativo: boolean; atividades: string[] }>
) {
  await connectDB()
  return FuncaoModel.findByIdAndUpdate(id, dados, { new: true }).lean()
}

export async function deletarFuncao(id: string) {
  await connectDB()
  return FuncaoModel.findByIdAndDelete(id)
}
