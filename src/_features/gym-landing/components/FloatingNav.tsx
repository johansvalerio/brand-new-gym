'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Dumbbell, MapPin, Users, CreditCard, Camera, LogIn } from 'lucide-react';

const links = [
  { name: 'Inicio', href: '/#home', icon: Home },
  { name: 'Equipamiento', href: '/#equipment', icon: Dumbbell },
  { name: 'Galería', href: '/#gallery', icon: Camera },
  { name: 'Entrenadores', href: '/#coaches', icon: Users },
  { name: 'Planes', href: '/#membership', icon: CreditCard },
  { name: 'Ubicación', href: '/#location', icon: MapPin },
  { name: 'Ingresar', href: '/auth/login', icon: LogIn },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed -top-1 left-0 right-0 z-90 pointer-events-none px-6 py-6 flex justify-center">
      <div className={cn(
        "flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full border bg-background/70 backdrop-blur-md pointer-events-auto transition-all duration-300",
        scrolled ? "border-primary/40 shadow-[0_0_20px_rgba(150,217,6,0.15)] bg-background/90" : "border-border/50"
      )}>
        {links.map((link, i) => {
  const Icon = link.icon;

  return (
    <a
      key={i}
      href={link.href}
      className="
        flex items-center gap-2
        group px-3 py-2 rounded-full
        hover:bg-primary/20
        transition-all duration-300
      "
    >
      <Icon
        className="
          w-4 h-4
          text-muted-foreground
          group-hover:text-primary
          transition-colors duration-300
        "
      />

     <span
  className="
    hidden
    md:block
    md:max-w-0
    md:opacity-0
    md:overflow-hidden
    md:whitespace-nowrap
    md:-translate-x-2
    md:group-hover:max-w-[120px]
    md:group-hover:opacity-100
    md:group-hover:translate-x-0
    text-sm font-mono font-medium
    text-muted-foreground
    group-hover:text-primary
    transition-all duration-400 ease-out
  "
>
  {link.name}
</span>
    </a>
  );
})}
      </div>
    </nav>
  );
}
