'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

// Duración de cada mitad de la transición (ms)
export const TRANSITION_DURATION_MS = 320;

// Si la navegación no completa el ciclo (p.ej. el proxy redirige /auth/login
// de vuelta a la misma ruta), la cortina se destapa sola tras este tiempo.
const STUCK_RECOVERY_MS = 1400;

export function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const coveringRef = useRef(false);
  const recoveryTimerRef = useRef<number | null>(null);
  const pendingHrefRef = useRef<string | null>(null);

  const clearRecovery = () => {
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  };

  const reveal = () => {
    const el = overlayRef.current;
    if (!el || !coveringRef.current) return;

    coveringRef.current = false;
    pendingHrefRef.current = null;
    clearRecovery();

    // iOS fix: mata tweens previos y usa xPercent (no x con %)
    gsap.killTweensOf(el);
    gsap.to(el, {
      xPercent: 100,
      duration: TRANSITION_DURATION_MS / 1000,
      ease: 'power3.inOut',
      force3D: true,
      overwrite: 'auto',
      onComplete: () => {
        // deja el overlay fuera de pantalla y sin bloquear clicks
        gsap.set(el, { xPercent: 100 });
        el.style.pointerEvents = 'none';
      },
    });
  };

  // Animación de ENTRADA: cuando la ruta cambia, la cortina sale (reveal)
  useEffect(() => {
    reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Fix iPhone bfcache: al volver con gesto atrás, el overlay puede quedar tapando
  useEffect(() => {
    const onPageShow = () => {
      // si el navegador restaura la página del cache, fuerza reveal
      if (coveringRef.current) reveal();
      else {
        const el = overlayRef.current;
        if (el) gsap.set(el, { xPercent: 100 });
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reduce motion: sin animación
  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Escucha el evento de salida lanzado por usePageTransition
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    // estado inicial consistente con xPercent
    gsap.set(el, { xPercent: 100 });
    el.style.pointerEvents = 'none';

    const handleExit = (e: Event) => {
      const detail = (e as CustomEvent<{ href?: string }>).detail;
      const href = detail?.href;

      // si ya está cubriendo, ignora clicks dobles (evita doble push en iPhone double-tap)
      if (coveringRef.current) return;

      // si es reduce-motion, navega directo sin animar
      if (prefersReducedMotion()) {
        if (href) router.push(href);
        return;
      }

      coveringRef.current = true;
      pendingHrefRef.current = href ?? null;
      el.style.pointerEvents = 'auto';

      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { xPercent: -100 },
        {
          xPercent: 0,
          duration: TRANSITION_DURATION_MS / 1000,
          ease: 'power3.inOut',
          force3D: true,
          overwrite: 'auto',
          onComplete: () => {
            // navegación SIEMPRE después de que la cortina tapa (evita race en iOS donde setTimeout se pausa)
            if (pendingHrefRef.current) {
              const target = pendingHrefRef.current;
              pendingHrefRef.current = null;
              router.push(target);
            }
          },
        }
      );

      // Red de seguridad: si el pathname no llega a cambiar (redirect del
      // proxy a la misma ruta, navegación fallida, o router.push bloqueado en iOS),
      // destapar igual para no dejar la app bloqueada.
      clearRecovery();
      recoveryTimerRef.current = window.setTimeout(() => {
        // si aún está cubriendo, intenta hard-navigate como último recurso en iPhone
        if (coveringRef.current && pendingHrefRef.current) {
          const target = pendingHrefRef.current;
          pendingHrefRef.current = null;
          // intenta SPA push de nuevo, si falla hace hard reload
          try {
            router.push(target);
          } catch {
            window.location.assign(target);
          }
          // destapa de todos modos tras un breve delay
          window.setTimeout(reveal, 80);
        } else {
          reveal();
        }
      }, STUCK_RECOVERY_MS);
    };

    window.addEventListener('gsap-page-exit', handleExit as EventListener);
    return () => {
      window.removeEventListener('gsap-page-exit', handleExit as EventListener);
      clearRecovery();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      // xPercent 100 = fuera a la derecha; will-change para iOS GPU
      style={{ transform: 'translateX(100%)', willChange: 'transform' }}
      className="pointer-events-none fixed inset-0 z-[9999] bg-primary"
    />
  );
}
