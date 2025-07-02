import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('manifest.json') ||
    pathname.endsWith('site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/login') // ← ログイン画面自体も除外
  ) {
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

export const config = {
  matcher: '/:path*',
}
