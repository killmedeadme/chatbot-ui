import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 🐇 認証をかけたくないパス
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('manifest.json') ||
    pathname.endsWith('site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/login') // ログインページ自体も除外
  ) {
    console.log(`🐇 PANTAS: 除外パスヒット → ${pathname}`)
    return NextResponse.next()
  }

  // 🐇 Basic Auth
  const basicAuth = req.headers.get('authorization')

  const USER = process.env.BASIC_AUTH_USER || ''
  const PASS = process.env.BASIC_AUTH_PASS || ''

  console.log("🐇 PANTAS ENV USER:", USER)
  console.log("🐇 PANTAS ENV PASS:", PASS)

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pass] = atob(authValue).split(':')

    console.log("🐇 PANTAS Provided:", user, pass)

    if (user === USER && pass === PASS) {
      console.log("✅ PANTAS: 認証成功")
      return NextResponse.next()
    } else {
      console.log("❌ PANTAS: 認証失敗（値不一致）")
    }
  } else {
    console.log("❌ PANTAS: 認証ヘッダーなし")
  }

  // 🐇 認証失敗した場合
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