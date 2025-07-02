import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 認証をかけたくないパス（必須のNext.js内部やAPI）
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  const USER = process.env.BASIC_AUTH_USER || ''
  const PASS = process.env.BASIC_AUTH_PASS || ''

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pass] = atob(authValue).split(':')

    if (user === USER && pass === PASS) {
      return NextResponse.next()
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}