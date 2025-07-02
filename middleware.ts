import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // 🔥 ログで実際にどんな pathname が来ているか確認
  console.log("🔥 pathname:", req.nextUrl.pathname)

  const pathname = req.nextUrl.pathname

  // 🔍 一旦 matcher 条件は外し、if の除外条件で確認する
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('manifest.json') ||
    pathname.endsWith('site.webmanifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    console.log("✅ 除外ヒット:", pathname)
    return NextResponse.next()
  }

  // ✅ Basic認証
  const basicAuth = req.headers.get('authorization')

  const USER = process.env.BASIC_AUTH_USER || ''
  const PASS = process.env.BASIC_AUTH_PASS || ''

  console.log("👀 BasicAuthヘッダ:", basicAuth)

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pass] = atob(authValue).split(':')

    console.log("🔑 認証入力:", user, pass)

    if (user === USER && pass === PASS) {
      console.log("✅ 認証成功")
      return NextResponse.next()
    }
  }

  console.log("❌ 認証失敗")
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm=\"Secure Area\"',
    },
  })
}

// ✅ 必ず全ルートでミドルウェアを適用（除外は if に任せる）
export const config = {
  matcher: '/:path*',
}
