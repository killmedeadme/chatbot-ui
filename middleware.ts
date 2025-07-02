export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  console.log('🔥 pathname:', pathname)

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('manifest') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    console.log('✅ 除外ヒット:', pathname)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
