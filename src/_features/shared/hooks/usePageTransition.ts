'use client';

import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function usePageTransition() {
    const pathname = usePathname();

    const navigate = useCallback(
        (href: string) => {
            if (typeof window === 'undefined') return;

            // Si ya estamos en esa ruta, no hacer nada
            // (evita que la cortina quede pegada al navegar a la misma página)
            const targetPath = href.split('?')[0].split('#')[0];
            if (targetPath === pathname) return;

            // Delega la animación + router.push al overlay.
            // El overlay hace: cover (xPercent -100→0) → onComplete router.push → reveal (0→100) al cambiar pathname.
            // Esto evita el race de iPhone donde setTimeout + router.push se desincroniza de GSAP (cover a mitad).
            window.dispatchEvent(new CustomEvent('gsap-page-exit', { detail: { href } }));
        },
        [pathname]
    );

    return { navigate };
}
