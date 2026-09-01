import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Protect authenticated routes
    const protectedPaths = ['/dashboard', '/users', '/products', '/routines', '/membership', '/payments', '/plans', '/workout', '/nutrition']
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    const authPaths = ['/auth/login']
    const isAuthPath = authPaths.some(path => request.nextUrl.pathname === path)

    if (isAuthPath && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
