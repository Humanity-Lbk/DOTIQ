import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/assessment', '/dashboard', '/report']

// Routes exempt from the site-wide password gate
const gateExemptRoutes = ['/coming-soon', '/api/gate-auth', '/_next', '/favicon']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // --- Site-wide password gate ---
  const isExempt = gateExemptRoutes.some(r => path.startsWith(r))
  if (!isExempt) {
    const gateToken = request.cookies.get('dotiq_gate')?.value
    if (gateToken !== 'humanity_granted') {
      const gateUrl = new URL('/coming-soon', request.url)
      return NextResponse.redirect(gateUrl)
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add any code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    const redirectResponse = NextResponse.redirect(loginUrl)
    // Copy over any refreshed cookies so the session stays intact
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
