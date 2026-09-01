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
import { Home, Dumbbell, MapPin, Users, CreditCard, Camera, LogIn, Package, UserPlus, Flame, LogOut, UserCircle, Trophy, Bell, Banknote, LayoutDashboard, CalendarDays, Utensils } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePageTransition } from '@/_features/shared/hooks/usePageTransition';
import { usePathname } from 'next/navigation';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/_features/shared/hooks/useNotifications';

const links = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Equipamiento', href: '/#equipment', icon: Dumbbell },
  { name: 'Galería', href: '/#gallery', icon: Camera },
  { name: 'Entrenadores', href: '/#coaches', icon: Users },
  { name: 'Planes', href: '/#membership', icon: CreditCard },
  { name: 'Ubicación', href: '/#location', icon: MapPin },
  { name: 'Ingresar', href: '/auth/login', icon: LogIn, transition: true },
];

type UserProfile = {
  name: string;
  email: string | null;
  avatar: string | null;
  isAdmin: boolean;
  isCoach: boolean;
  profileId: string | null;
};

function getUserProfile(
  user: { user_metadata?: Record<string, unknown>; email?: string | null } | null,
  isAdmin: boolean,
  isCoach: boolean,
  profileId: string | null,
): UserProfile | null {
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
    isAdmin, // viene del hook → DB, no de user_metadata
    isCoach,
    profileId,
  };
}

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, isAdmin, isCoach, profile } = useAuthSession();
  const userProfile = useMemo(
    () => getUserProfile(user, isAdmin, isCoach, profile?.id ?? null),
    [user, isAdmin, isCoach, profile],
  );
  const { navigate } = usePageTransition();
  const pathname = usePathname();

  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;

  // En rutas app (/dashboard, /workout...) el sidebar reemplaza al floating nav — después de todos los hooks
  if (["/dashboard", "/users", "/workout", "/routines", "/membership", "/products", "/payments", "/plans", "/nutrition"].some((p) => pathname.startsWith(p))) {
    return null;
  }

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
              <div key={link.name} className="flex items-center gap-1">
                <NotificationBell />
                <AvatarDropdown user={userProfile} />
              </div>
            ) : (
              <button
                key={index}
                onClick={() => navigate(link.href)}
                className="group flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 hover:bg-primary/20"
              >
                <Icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                <span className="hidden text-sm font-mono font-medium text-muted-foreground transition-all duration-400 ease-out group-hover:text-primary md:block md:max-w-0 md:overflow-hidden md:whitespace-nowrap md:opacity-0 md:-translate-x-2 md:group-hover:max-w-30 md:group-hover:opacity-100 md:group-hover:translate-x-0">
                  {link.name}
                </span>
              </button>
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
  const { navigate } = usePageTransition();
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full cursor-pointer border border-primary/25 bg-background/80 p-0 shadow-[0_0_18px_rgba(150,217,6,0.12)] transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_24px_rgba(150,217,6,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <div className="flex h-9 w-9 items-center justify-center rounded-full">
          <Avatar className="h-7 w-7 ring-2 ring-background">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/15 text-[10px] font-black tracking-[0.12em] text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
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
          <DropdownMenuItem onClick={() => navigate('/dashboard')}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </DropdownMenuItem>
          {user.profileId ? (
            <DropdownMenuItem onClick={() => navigate(`/users/profile/${user.profileId}`)} className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
              <UserCircle className="h-4 w-4 mr-1" />
              Mi perfil
            </DropdownMenuItem>
          ) : null}
          {user.profileId ? (
            <DropdownMenuItem onClick={() => navigate('/workout')} className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
              <Dumbbell className="h-4 w-4 mr-1" />
              Entrenar
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => navigate('/workout/history')} className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <CalendarDays className="h-4 w-4 mr-1" />
            Histórico
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/users/profile/${user.profileId}/routine`)}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <Flame className="h-4 w-4 mr-1" />
            Rutinas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/nutrition')}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <Utensils className="h-4 w-4 mr-1" />
            Nutrición
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/routines')}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <Trophy className="h-4 w-4 mr-1" />
            Ranking de rutinas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/membership')}
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <CreditCard className="h-4 w-4 mr-1" />
            Mi membresía
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/products')} className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
            <Package className="h-4 w-4 mr-1" />
            Productos
          </DropdownMenuItem>
          {
            (user.isAdmin || user.isCoach) && (
              <DropdownMenuItem onClick={() => navigate('/users')} className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
                <UserPlus className="h-4 w-4 mr-1" />
                Usuarios
              </DropdownMenuItem>
            )
          }
          {user.isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/payments')}
              className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
              <Banknote className="h-4 w-4 mr-1" />
              Pagos
            </DropdownMenuItem>
          )}
          {user.isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/plans')}
              className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary focus:bg-primary">
              <CreditCard className="h-4 w-4 mr-1" />
              Planes
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-medium transition-colors hover:bg-destructive/10 focus:bg-destructive"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' });
}

function NotificationBell() {
  const { data: notifications = [] } = useNotifications(true);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const { navigate } = usePageTransition();

  const unread = notifications.filter((n) => !n.read).length;

  const handleItemClick = (
    id: number,
    read: boolean,
    link: string | null,
  ) => {
    if (!read) markRead.mutate(id);
    if (link) navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ''}`}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary/25 bg-background/80 shadow-[0_0_18px_rgba(150,217,6,0.12)] transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_24px_rgba(150,217,6,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Bell className="h-4 w-4 text-muted-foreground transition-colors duration-300 hover:text-primary" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-black leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-80 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-2 py-1">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notificaciones
          </p>
          {unread > 0 ? (
            <button
              onClick={() => markAll.mutate()}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
            >
              Marcar todas
            </button>
          ) : null}
        </div>

        <DropdownMenuSeparator className="my-1" />

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Sin notificaciones por ahora.
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() =>
                  handleItemClick(notification.id, notification.read, notification.link)
                }
                className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${notification.read
                  ? 'opacity-60 hover:bg-secondary'
                  : 'bg-primary/5 hover:bg-primary/15'
                  }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-transparent' : 'bg-primary shadow-[0_0_6px_rgba(150,217,6,0.8)]'
                    }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-sans text-sm font-semibold text-foreground">
                      {notification.title}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] uppercase text-muted-foreground">
                      {timeAgo(notification.created_at)}
                    </span>
                  </span>
                  {notification.body ? (
                    <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                      {notification.body}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
