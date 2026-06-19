import mongoose from 'mongoose'
import { syncTTLIndexes } from './ttl'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI não definido nas variáveis de ambiente')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then(async (m) => {
        // Sincroniza TTL indexes com os valores configurados (não bloqueia)
        syncTTLIndexes(m).catch((e) => console.error('[TTL] sync failed:', e))
        return m
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
