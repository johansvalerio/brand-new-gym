'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { TRANSITION_DURATION_MS } from '@/_features/shared/components/PageTransitionOverlay';

export function usePageTransition() {
    const router = useRouter();
    const pathname = usePathname();

    const navigate = useCallback(
        (href: string) => {
            // Si ya estamos en esa ruta, no hacer nada
            // (evita que la cortina quede pegada al navegar a la misma página)
            const targetPath = href.split('?')[0].split('#')[0];
            if (targetPath === pathname) return;

            // 1. Dispara el evento → la cortina "entra" tapando la pantalla
            window.dispatchEvent(new CustomEvent('gsap-page-exit'));

            // 2. Espera a que termine la animación de salida, luego navega
            setTimeout(() => {
                router.push(href);
            }, TRANSITION_DURATION_MS + 20);
        },
        [router, pathname]
    );

    return { navigate };
}
