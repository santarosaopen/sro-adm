import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sro-default-secret-change-in-production'
)

export interface AdminPayload {
  username: string
  nome: string
  userId: string
}

export async function extrairAdmin(request: NextRequest): Promise<AdminPayload | null> {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return {
      username: (payload.username as string) || 'admin',
      nome: (payload.nome as string) || 'Administrador',
      userId: (payload.userId as string) || '',
    }
  } catch {
    return null
  }
}
