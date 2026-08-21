'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthSession } from '@/_features/auth/hooks/useAuthSession';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Dumbbell, MapPin, Users, CreditCard, Camera, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { name: 'Inicio', href: '/#home', icon: Home },
  { name: 'Equipamiento', href: '/#equipment', icon: Dumbbell },
  { name: 'Galería', href: '/#gallery', icon: Camera },
  { name: 'Entrenadores', href: '/#coaches', icon: Users },
  { name: 'Planes', href: '/#membership', icon: CreditCard },
  { name: 'Ubicación', href: '/#location', icon: MapPin },
  { name: 'Ingresar', href: '/auth/login', icon: LogIn },
];

type UserProfile = {
  name: string;
  email: string | null;
  avatar: string | null;
};

function getUserProfile(user: { user_metadata?: Record<string, unknown>; email?: string | null } | null): UserProfile | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const name =
    (typeof metadata.full_name === 'string' && metadata.full_name.trim()) ||
    (typeof metadata.name === 'string' && metadata.name.trim()) ||
    (typeof metadata.preferred_username === 'string' && metadata.preferred_username.trim()) ||
    (user.email ? user.email.split('@')[0] : 'Usuario');

  const avatar =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url.trim()) ||
    (typeof metadata.picture === 'string' && metadata.picture.trim()) ||
    (typeof metadata.image_url === 'string' && metadata.image_url.trim()) ||
    null;

  return {
    name,
    email: user.email ?? null,
    avatar,
  };
}

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuthSession();
  const userProfile = useMemo(() => getUserProfile(user), [user]);

  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  return (
    <nav className="fixed -top-1 left-0 right-0 z-90 pointer-events-none flex justify-center px-6 py-6">
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-1 rounded-full border bg-background/70 px-3 py-2 backdrop-blur-md transition-all duration-300 sm:gap-2',
          scrolled
            ? 'border-primary/40 bg-background/90 shadow-[0_0_20px_rgba(150,217,6,0.15)]'
            : 'border-border/50',
        )}
      >
        {links.map((link, index) => {
          const Icon = link.icon;

          if (link.name === 'Ingresar') {
            return userProfile ? (
              <AvatarDropdown key={link.name} user={userProfile} />
            ) : (
              <a
                key={index}
                href={link.href}
                className="group flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 hover:bg-primary/20"
              >
                <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                <span className="hidden text-sm font-mono font-medium text-muted-foreground transition-all duration-400 ease-out group-hover:text-primary md:block md:max-w-0 md:overflow-hidden md:whitespace-nowrap md:opacity-0 md:-translate-x-2 md:group-hover:max-w-30 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                  {link.name}
                </span>
              </a>
            );
          }

          return (
            <a
              key={index}
              href={link.href}
              className="group flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 hover:bg-primary/20"
            >
              <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
              <span className="hidden text-sm font-mono font-medium text-muted-foreground transition-all duration-400 ease-out group-hover:text-primary md:block md:max-w-0 md:overflow-hidden md:whitespace-nowrap md:opacity-0 md:-translate-x-2 md:group-hover:max-w-30 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                {link.name}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function AvatarDropdown({ user }: { user: UserProfile }) {
  const supabase = createClient();
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border border-primary/25 bg-background/80 p-0 shadow-[0_0_18px_rgba(150,217,6,0.12)] transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_24px_rgba(150,217,6,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <div className="flex h-11 w-11 items-center justify-center rounded-full">
          <Avatar className="h-9 w-9 ring-2 ring-background">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/15 text-[10px] font-black tracking-[0.12em] text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-72 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/60 px-3 py-3">
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/15 text-xs font-black text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            {user.email ? <p className="truncate text-[11px] text-muted-foreground">{user.email}</p> : null}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            Facturación
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primar">
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium transition-colors hover:bg-destructive/10 focus:bg-destructive"
            onClick={() => void handleLogout()}
          >
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
