import { connectDB } from '@/lib/mongodb'
import LeituraAguaModel from '@/models/LeituraAgua'

export async function buscarLeituras(tipo?: string) {
  await connectDB()
  const filtro = tipo ? { tipo } : {}
  return LeituraAguaModel.find(filtro).sort({ data: -1 }).lean()
}

export async function salvarLeitura(dados: {
  valor: number
  data: string
  tipo: 'diaria' | 'mensal'
  cota?: number
}) {
  await connectDB()
  return LeituraAguaModel.create({ ...dados, data: new Date(dados.data) })
}

export async function editarLeitura(id: string, dados: { valor?: number; data?: string }) {
  await connectDB()
  const update: Record<string, unknown> = {}
  if (dados.valor !== undefined) update.valor = dados.valor
  if (dados.data) update.data = new Date(dados.data)
  return LeituraAguaModel.findByIdAndUpdate(id, update, { new: true }).lean()
}

export async function deletarLeitura(id: string) {
  await connectDB()
  return LeituraAguaModel.findByIdAndDelete(id)
}

export function calcularEstatisticas(leituras: { valor: number; data: Date | string }[]) {
  const diarias = leituras.filter((l) => l.valor > 0)
  if (!diarias.length) return { maximo: null, minimo: null }

  const ordenado = [...diarias].sort((a, b) => b.valor - a.valor)
  return {
    maximo: ordenado[0],
    minimo: ordenado[ordenado.length - 1],
  }
}
