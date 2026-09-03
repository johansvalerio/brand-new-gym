'use client';

import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function usePageTransition() {
    const pathname = usePathname();

    // Slug del gym actual (null en rutas globales /auth/* y en la raíz).
    const segs = pathname.split("/").filter(Boolean);
    const gymSlug = segs[0] === "auth" || segs.length === 0 ? null : segs[0];

    const resolveHref = useCallback(
        (href: string) => {
            if (!href.startsWith("/") || href.startsWith("/auth") || !gymSlug) return href;
            if (href === `/${gymSlug}` || href.startsWith(`/${gymSlug}/`)) return href;
            return `/${gymSlug}${href}`;
        },
        [gymSlug]
    );

    const navigate = useCallback(
        (href: string) => {
            if (typeof window === 'undefined') return;

            const resolved = resolveHref(href);
            // Si ya estamos en esa ruta, no hacer nada
            // (evita que la cortina quede pegada al navegar a la misma página)
            const targetPath = resolved.split('?')[0].split('#')[0];
            if (targetPath === pathname) return;

            // Delega la animación + router.push al overlay.
            // El overlay hace: cover (xPercent -100→0) → onComplete router.push → reveal (0→100) al cambiar pathname.
            // Esto evita el race de iPhone donde setTimeout + router.push se desincroniza de GSAP (cover a mitad).
            window.dispatchEvent(new CustomEvent('gsap-page-exit', { detail: { href: resolved } }));
        },
        [pathname, resolveHref]
    );

    return { navigate };
}
