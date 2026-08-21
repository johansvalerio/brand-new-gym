'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

// Duración de cada mitad de la transición (ms)
export const TRANSITION_DURATION_MS = 320;

export function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Animación de ENTRADA: cuando la ruta cambia, la cortina sale (reveal)
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    // Si la cortina está cubriendo la pantalla (desde la salida anterior), la sacamos
    gsap.fromTo(
      el,
      { x: '0%' },
      {
        x: '100%',
        duration: TRANSITION_DURATION_MS / 1000,
        ease: 'power3.inOut',
      }
    );
  }, [pathname]);

  // Escucha el evento de salida lanzado por usePageTransition
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const handleExit = () => {
      gsap.fromTo(
        el,
        { x: '-100%' },
        {
          x: '0%',
          duration: TRANSITION_DURATION_MS / 1000,
          ease: 'power3.inOut',
        }
      );
    };

    window.addEventListener('gsap-page-exit', handleExit);
    return () => window.removeEventListener('gsap-page-exit', handleExit);
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
