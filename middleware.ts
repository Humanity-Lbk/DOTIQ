import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const protectedRoutes = ['/assessment', '/dashboard', '/report']

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)
  
  // Check if current path needs protection
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  if (isProtectedRoute) {
    // Create a Supabase client to check auth
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
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to sign-up with return URL
      const signUpUrl = new URL('/auth/sign-up', request.url)
      signUpUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(signUpUrl)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
