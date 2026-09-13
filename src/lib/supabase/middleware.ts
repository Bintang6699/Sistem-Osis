import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/session'

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  const user = await getSession()

  // Protect dashboard routes
  const protectedPaths = ['/dashboard', '/kas-masuk', '/kas-keluar', '/transaksi', '/anggota', '/laporan', '/pengaturan']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect root to dashboard or login
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
