import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 🔥 ログでどのパスが飛んできているかを徹底監視
  console.log('🔥 pathname:', pathname)

  if (pathname.includes('manifest')) {
    console.log('🔍 manifestにマッチ:', pathname)
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('manifest.json') ||
    pathname.endsWith('site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    // ✅ ロケール付き manifest も明示除外
    pathname.endsWith('/manifest.json') ||
    pathname.match(/^\/[a-z]{2}\/manifest\.json$/)
  ) {
    console.log('✅ 除外ヒット:', pathname)
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  const USER = process.env.BASIC_AUTH_USER || ''
  const PASS = process.env.BASIC_AUTH_PASS || ''

  console.log('👀 BasicAuthヘッダ:', basicAuth)

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pass] = atob(authValue).split(':')

    console.log('🔑 認証入力:', user, pass)

    if (user === USER && pass === PASS) {
      console.log('✅ 認証成功')
      return NextResponse.next()
    }
  }

  console.log('❌ 認証失敗')

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

// ✅ matcher は最終的にすべて通して、除外条件は if に一任するパターン
export const config = {
  matcher: '/:path*',
}
