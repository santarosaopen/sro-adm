import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sro-default-secret-change-in-production'
)

const TOKEN_COOKIE = 'admin-token'
const TOKEN_EXPIRY = '8h'

export async function createToken(username: string, userId: string, nome: string): Promise<string> {
  return new SignJWT({ role: 'admin', username, userId, nome })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  return jwtVerify(token, SECRET)
}

export { TOKEN_COOKIE }
