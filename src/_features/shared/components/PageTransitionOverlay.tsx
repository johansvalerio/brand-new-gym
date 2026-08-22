'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

// Duración de cada mitad de la transición (ms)
export const TRANSITION_DURATION_MS = 320;

// Si la navegación no completa el ciclo (p.ej. el proxy redirige /auth/login
// de vuelta a la misma ruta), la cortina se destapa sola tras este tiempo.
const STUCK_RECOVERY_MS = 1200;

export function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const coveringRef = useRef(false);
  const recoveryTimerRef = useRef<number | null>(null);

  const reveal = () => {
    const el = overlayRef.current;
    if (!el || !coveringRef.current) return;

    coveringRef.current = false;
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }

    gsap.fromTo(
      el,
      { x: '0%' },
      {
        x: '100%',
        duration: TRANSITION_DURATION_MS / 1000,
        ease: 'power3.inOut',
      }
    );
  };

  // Animación de ENTRADA: cuando la ruta cambia, la cortina sale (reveal)
  useEffect(() => {
    reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escucha el evento de salida lanzado por usePageTransition
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const handleExit = () => {
      coveringRef.current = true;

      gsap.fromTo(
        el,
        { x: '-100%' },
        {
          x: '0%',
          duration: TRANSITION_DURATION_MS / 1000,
          ease: 'power3.inOut',
        }
      );

      // Red de seguridad: si el pathname no llega a cambiar (redirect del
      // proxy a la misma ruta, navegación fallida), destapar igual.
      if (recoveryTimerRef.current !== null) {
        window.clearTimeout(recoveryTimerRef.current);
      }
      recoveryTimerRef.current = window.setTimeout(reveal, STUCK_RECOVERY_MS);
    };

    window.addEventListener('gsap-page-exit', handleExit);
    return () => {
      window.removeEventListener('gsap-page-exit', handleExit);
      if (recoveryTimerRef.current !== null) {
        window.clearTimeout(recoveryTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{ transform: 'translateX(100%)' }} // off-screen por defecto
      className="pointer-events-none fixed inset-0 z-[9999] bg-primary"
    />
  );
}
