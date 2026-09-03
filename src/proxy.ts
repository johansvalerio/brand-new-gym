import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const GLOBAL_PREFIXES = ['/auth', '/api']

async function ownSlug(
    supabase: ReturnType<typeof createServerClient>,
    authId: string
): Promise<string | null> {
    const { data: profile } = await supabase
        .from("users")
        .select("gym_id")
        .eq("auth_id", authId)
        .maybeSingle()
    if (!profile?.gym_id) return null
    const { data: gym } = await supabase
        .from("gyms")
        .select("slug")
        .eq("id", profile.gym_id)
        .maybeSingle()
    return gym?.slug ?? null
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // El layout raíz y [gym]/layout leen estos headers (GymProvider, first-join, guard).
    const firstSeg = pathname.split("/").filter(Boolean)[0] ?? ""
    const isGlobal =
        pathname === "/" ||
        GLOBAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
    if (!isGlobal && firstSeg) {
        request.headers.set("x-gym-slug", firstSeg)
    }
    request.headers.set("x-pathname", pathname)

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

    // ---- Rutas globales ----
    if (isGlobal) {
        // Logueado en /auth/login → a SU dashboard (respeta ?next= si es de su gym).
        if (pathname === "/auth/login" && user) {
            const slug = (await ownSlug(supabase, user.id)) ?? "gym-ulate"
            const next = request.nextUrl.searchParams.get("next")
            const dest =
                next && next.startsWith(`/${slug}/`) ? next : `/${slug}/dashboard`
            return NextResponse.redirect(new URL(dest, request.url))
        }
        return supabaseResponse
    }

    // ---- Rutas con slug: /[slug] (landing pública) o /[slug]/... (app privada) ----
    const slug = firstSeg
    const isLanding = pathname === `/${slug}` || pathname === `/${slug}/`

    if (!user) {
        // Landing pública: cualquiera entra (sirve para compartir por WhatsApp).
        if (isLanding) return supabaseResponse
        const login = new URL("/auth/login", request.url)
        login.searchParams.set("gym", slug)
        login.searchParams.set("next", pathname)
        return NextResponse.redirect(login)
    }

    // Logueado: solo su gym. Sin gym (primer login) pasa — el layout lo asigna.
    // La landing ajena se puede ver; la app ajena redirige a tu dashboard.
    if (!isLanding) {
        const mine = await ownSlug(supabase, user.id)
        if (mine && mine !== slug) {
            const rest = pathname.slice(slug.length + 1) // conserva subruta + query
            const dest = new URL(`/${mine}${rest}${request.nextUrl.search}`, request.url)
            return NextResponse.redirect(dest)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
