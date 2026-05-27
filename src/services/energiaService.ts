import { connectDB } from '@/lib/mongodb'
import LeituraEnergiaModel from '@/models/LeituraEnergia'

export async function buscarLeituras(tipo?: string) {
  await connectDB()
  const filtro = tipo ? { tipo } : {}
  return LeituraEnergiaModel.find(filtro).sort({ data: -1 }).lean()
}

export async function salvarLeitura(dados: {
  valor: number
  data: string
  tipo: 'diaria' | 'mensal'
}) {
  await connectDB()
  return LeituraEnergiaModel.create({ ...dados, data: new Date(dados.data) })
}

export async function deletarLeitura(id: string) {
  await connectDB()
  return LeituraEnergiaModel.findByIdAndDelete(id)
}

export function calcularEstatisticas(leituras: { valor: number; data: Date | string }[]) {
  if (!leituras.length) return { maximo: null, minimo: null }
  const ordenado = [...leituras].sort((a, b) => b.valor - a.valor)
  return {
    maximo: ordenado[0],
    minimo: ordenado[ordenado.length - 1],
  }
}

export function calcularCusto(kWh: number, tarifaPorKWh: number): number {
  return parseFloat((kWh * tarifaPorKWh).toFixed(2))
}
