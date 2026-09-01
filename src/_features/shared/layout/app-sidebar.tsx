"use client"

import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, UserCircle, Dumbbell, Flame, Trophy, CreditCard, Package, Users, Banknote, LogOut, Menu, X, CalendarDays, Home, Bell, Utensils } from "lucide-react"
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/_features/shared/hooks/useNotifications"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

type NavItem = { label: string; href: string; icon: React.ElementType; adminOnly?: boolean; coachOrAdmin?: boolean }

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "General",
    items: [
      { label: "Inicio", href: "/", icon: Home },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mi perfil", href: "/users/profile/me", icon: UserCircle },
    ],
  },
  {
    title: "Entrenamiento",
    items: [
      { label: "Entrenar", href: "/workout", icon: Dumbbell },
      { label: "Histórico", href: "/workout/history", icon: CalendarDays },
      { label: "Rutinas", href: "/users/profile/me/routine", icon: Flame },
      { label: "Nutrición", href: "/nutrition", icon: Utensils },
      { label: "Ranking", href: "/routines", icon: Trophy },
    ],
  },
  {
    title: "Membresía",
    items: [
      { label: "Mi membresía", href: "/membership", icon: CreditCard },
      { label: "Productos", href: "/products", icon: Package },
    ],
  },
  {
    title: "Administración",
    items: [
      { label: "Usuarios", href: "/users", icon: Users, coachOrAdmin: true },
      { label: "Pagos", href: "/payments", icon: Banknote, adminOnly: true },
      { label: "Planes", href: "/plans", icon: CreditCard, adminOnly: true },
    ],
  },
]

/* ─── Notification bell ─── */
function SidebarNotificationBell({ collapsed, isMobile = false }: { collapsed: boolean; isMobile?: boolean }) {
  const { data: notifications = [] } = useNotifications(true)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const { navigate } = usePageTransition()
  const unread = notifications.filter((n) => !n.read).length

  const handleClick = (id: number, read: boolean, link: string | null) => {
    if (!read) markRead.mutate(id)
    if (link) navigate(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group/bell relative flex w-full cursor-pointer items-center overflow-hidden rounded-full py-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none",
          collapsed ? "justify-center px-0" : "gap-3 px-3",
        )}
        aria-label="Notificaciones"
      >
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed ? "pointer-events-none w-0 opacity-0" : "opacity-100")}>
          Notificaciones
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? "center" : "start"}
        side={isMobile ? "bottom" : "right"}
        sideOffset={isMobile ? 8 : 4}
        className={cn(
          "z-[60] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl",
          isMobile ? "w-[calc(100vw-2rem)] max-w-80" : "w-80",
        )}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Notificaciones</p>
          {unread > 0 && (
            <button onClick={() => markAll.mutate()} className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary">
              Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin notificaciones</p>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n.id, n.read, n.link)}
                className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2 text-left ${n.read ? "opacity-60 hover:bg-secondary" : "bg-primary/5 hover:bg-primary/15"}`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-primary"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-sm font-semibold text-foreground">{n.title}</span>
                  {n.body && <span className="block truncate font-mono text-xs text-muted-foreground">{n.body}</span>}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ─── Main sidebar ─── */
export function AppSidebar() {
  const pathname = usePathname()
  const { profile, isAdmin, isCoach } = useAuthSession()
  const { navigate } = usePageTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  const isAppRoute = useMemo(
    () => ["/dashboard", "/users", "/workout", "/routines", "/membership", "/products", "/payments", "/plans", "/nutrition"].some((p) => pathname.startsWith(p)),
    [pathname],
  )

  if (!isAppRoute) return null

  const profileHref = profile?.id ? `/users/profile/${profile.id}` : "/dashboard"

  /* ─── Resolve href for profile-based links ─── */
  const resolveHref = (item: NavItem) => {
    if (item.href === "/users/profile/me") return profileHref
    if (item.href === "/users/profile/me/routine") return profileHref + "/routine"
    return item.href
  }

  /* ─── Nav link component ─── */
  const NavLink = ({ item, isMobile = false }: { item: NavItem; isMobile?: boolean }) => {
    const href = resolveHref(item)
    const isActive = pathname === href
    const Icon = item.icon
    const showLabel = isMobile || !collapsed

    return (
      <button
        onClick={() => {
          navigate(href)
          setMobileOpen(false)
        }}
        aria-label={item.label}
        className={cn(
          "group/link relative flex w-full cursor-pointer items-center overflow-hidden rounded-full py-2 text-left font-sans text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          !isMobile && collapsed ? "justify-center px-0" : "gap-3 px-3",
        )}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          <Icon className={cn("h-5 w-5 transition-transform duration-150", !isActive && "group-hover/link:scale-110")} />
        </span>
        <span
          className={cn(
            "whitespace-nowrap transition-opacity duration-200",
            showLabel ? "opacity-100" : "pointer-events-none w-0 opacity-0",
          )}
        >
          {item.label}
        </span>
      </button>
    )
  }

  /* ─── Build visible sections ─── */
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.adminOnly && !isAdmin) return false
        if (item.coachOrAdmin && !(isAdmin || isCoach)) return false
        return true
      }),
    }))
    .filter((section) => section.items.length > 0)

  /* ─── Sidebar inner content ─── */
  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showLabel = isMobile || !collapsed
    return (
      <div className="flex h-full flex-col">
        {/* Logo — glitch estilo DURO (Hero5): "U" autónoma al colapsar, "GYM ULATE" al hover */}
        <div
          aria-label="GYM ULATE"
          className={cn("glitch-wrapper relative flex h-14 shrink-0 items-center overflow-hidden border-b border-border/50", !isMobile && collapsed ? "justify-center px-0" : "px-3")}
        >
          {/* Marca colapsada: U con glitch ambiental cada ~1.2s */}
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-flex h-8 w-8 shrink-0 items-center justify-center font-sans text-xl font-black uppercase leading-none text-foreground transition-opacity duration-200",
              showLabel ? "pointer-events-none absolute opacity-0" : "glitch-ambient opacity-100",
            )}
          >
            <span className="glitch-main inline-block">U</span>
            <span aria-hidden="true" className="glitch-a inline-flex items-center justify-center">U</span>
            <span aria-hidden="true" className="glitch-b inline-flex items-center justify-center">U</span>
          </span>

          {/* Wordmark expandido: GYM ULATE con glitch al hacer hover */}
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-block whitespace-nowrap font-sans text-sm font-black uppercase tracking-wider text-foreground transition-opacity duration-200",
              showLabel ? "opacity-100" : "pointer-events-none w-0 opacity-0",
            )}
          >
            <span className="glitch-main inline-block">GYM ULATE</span>
            <span aria-hidden="true" className="glitch-a">GYM ULATE</span>
            <span aria-hidden="true" className="glitch-b">GYM ULATE</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
          {visibleSections.map((section, idx) => (
            <div key={section.title}>
              {idx > 0 && <div className="mx-auto my-1.5 h-px w-8 bg-border/40" />}
              {section.items.map((item) => (
                <NavLink key={item.label} item={item} isMobile={isMobile} />
              ))}
            </div>
          ))}

          {/* Notifications */}
          <div className="mx-auto my-1.5 h-px w-8 bg-border/40" />
          <SidebarNotificationBell collapsed={isMobile ? false : collapsed} isMobile={isMobile} />
        </nav>

        {/* Footer: profile + actions */}
        <div className="shrink-0 border-t border-border/50 px-2 py-2">
          {/* Profile card */}
          {profile && (
            <div className={cn("mt-1 flex items-center overflow-hidden rounded-full py-2 transition-all duration-200", !isMobile && collapsed ? "justify-center px-0" : "gap-3 px-3")}>
              <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
                <AvatarImage src={profile.avatar ?? undefined} alt={profile.first_name ?? "U"} />
                <AvatarFallback className="bg-primary/15 text-xs font-black text-primary">
                  {(profile.first_name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn("min-w-0 flex-1 transition-opacity duration-200", showLabel ? "opacity-100" : "pointer-events-none hidden w-0 opacity-0")}>
                <p className="truncate text-sm font-semibold text-foreground">{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Usuario"}</p>
                <p className="truncate text-[11px] text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              navigate("/auth/login")
            }}
            className={cn(
              "flex w-full cursor-pointer items-center overflow-hidden rounded-full py-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
              !isMobile && collapsed ? "justify-center px-0" : "gap-3 px-3",
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <LogOut className="h-5 w-5" />
            </span>
            <span className={cn("whitespace-nowrap transition-opacity duration-200", showLabel ? "opacity-100" : "pointer-events-none w-0 opacity-0")}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex w-72 max-w-[80vw] flex-col bg-card shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <SidebarInner isMobile />
          </div>
        </div>
      )}

      {/* Desktop: narrow sidebar, expands on hover */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out lg:flex",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <SidebarInner />
      </aside>
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppRoute = ["/dashboard", "/users", "/workout", "/routines", "/membership", "/products", "/payments", "/plans", "/nutrition"].some((p) => pathname.startsWith(p))
  if (!isAppRoute) return <>{children}</>
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  )
}
