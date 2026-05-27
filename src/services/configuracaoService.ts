import { connectDB } from '@/lib/mongodb'
import ConfiguracaoModel, { IConfiguracao } from '@/models/Configuracao'
import type { FlattenMaps } from 'mongoose'

type ConfigLean = FlattenMaps<IConfiguracao> & { _id: unknown }

export async function buscarConfig(chave: string): Promise<number | string | null> {
  await connectDB()
  const config = (await ConfiguracaoModel.findOne({ chave }).lean()) as ConfigLean | null
  return config ? (config.valor as number | string) : null
}

export async function salvarConfig(chave: string, valor: number | string) {
  await connectDB()
  return ConfiguracaoModel.findOneAndUpdate(
    { chave },
    { chave, valor },
    { upsert: true, new: true }
  )
}
