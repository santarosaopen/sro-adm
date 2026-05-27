import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sro-default-secret-change-in-production'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) return NextResponse.next()

  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('admin-token')
    return response
  }
}

export const config = {
  matcher: '/admin/:path*',
}
