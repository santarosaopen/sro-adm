import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sro-default-secret-change-in-production'
)

const TOKEN_COOKIE = 'admin-token'
const TOKEN_EXPIRY = '8h'

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  return jwtVerify(token, SECRET)
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const validUser = process.env.ADMIN_USERNAME || 'admin'
  const validPass = process.env.ADMIN_PASSWORD || 'admin123'
  return username === validUser && password === validPass
}

export { TOKEN_COOKIE }
