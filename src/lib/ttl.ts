import type mongoose from 'mongoose'
import type { Db } from 'mongodb'

const DEFAULTS = {
  retencao_presencas_dias: 30,
  retencao_execucoes_dias: 90,
}

async function setTTL(db: Db, collectionName: string, field: string, days: number) {
  const seconds = days * 24 * 60 * 60
  try {
    await db.collection(collectionName).createIndex(
      { [field]: 1 },
      { expireAfterSeconds: seconds, background: true }
    )
  } catch (e: unknown) {
    const code = (e as { code?: number }).code
    if (code === 85 || code === 86) {
      await db.command({
        collMod: collectionName,
        index: { keyPattern: { [field]: 1 }, expireAfterSeconds: seconds },
      })
    }
  }
}

export async function syncTTLIndexes(conn: typeof mongoose) {
  try {
    const db = conn.connection.db as Db

    const configs = await db
      .collection('configuracaos')
      .find({ chave: { $in: ['retencao_presencas_dias', 'retencao_execucoes_dias'] } })
      .toArray()

    const get = (chave: string, def: number) => {
      const doc = configs.find((c) => c.chave === chave)
      return doc ? Number(doc.valor) : def
    }

    const presencasDias = get('retencao_presencas_dias', DEFAULTS.retencao_presencas_dias)
    const execucoesDias = get('retencao_execucoes_dias', DEFAULTS.retencao_execucoes_dias)

    await Promise.all([
      setTTL(db, 'registropontos', 'timestamp', presencasDias),
      setTTL(db, 'execucaoatividades', 'timestamp', execucoesDias),
    ])
  } catch (err) {
    console.error('[TTL] Erro ao sincronizar índices TTL:', err)
  }
}
