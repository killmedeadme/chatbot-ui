import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // ✅ 認証をかけたくないパス（Next.js内部、API、PWA、SEO用ファイルを除外）
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('manifest.json') ||   // ← endsWith に変更
    pathname.startsWith('/site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next()
  }

  // ✅ Basic認証設定
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

  // ✅ 認証失敗
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all paths except for internal paths (_next) and public files that must be open.
     */
    '/((?!_next|api|favicon.ico|manifest.json|site.webmanifest|robots.txt|sitemap.xml).*)',
  ],
}
