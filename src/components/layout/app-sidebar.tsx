"use client"

import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, UserCircle, Dumbbell, Flame, Trophy, CreditCard, Package, Users, Banknote, Settings, LogOut, Menu, X, CalendarDays, Home, Bell } from "lucide-react"
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/_features/shared/hooks/useNotifications"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

type NavItem = { label: string; href: string; icon: React.ElementType; adminOnly?: boolean; coachOrAdmin?: boolean }

type SidebarContentProps = { collapsed: boolean }

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "General",
    items: [
      { label: "Inicio", href: "/", icon: Home },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mi perfil", href: "/users/profile/me", icon: UserCircle }, // se resuelve a profileId en render
    ],
  },
  {
    title: "Entrenamiento",
    items: [
      { label: "Entrenar", href: "/workout", icon: Dumbbell },
      { label: "Histórico", href: "/workout/history", icon: CalendarDays },
      { label: "Mis Rutinas", href: "/users/profile/me/routine", icon: Flame },
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

function SidebarNotifications({ collapsed }: { collapsed: boolean }) {
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
          "flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          collapsed && "justify-center px-2",
        )}
        aria-label="Notificaciones"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bell className="h-4 w-4" />
          {unread > 0 ? <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-black text-white">{unread > 9 ? "9+" : unread}</span> : null}
        </span>
        <span className={cn("truncate transition-opacity duration-200", collapsed && "hidden")}>Notificaciones</span>
        <span className={cn("transition-opacity duration-200", collapsed && "hidden")}>{unread > 0 ? unread : notifications.length}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-80 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Notificaciones</p>
          {unread > 0 ? (
            <button onClick={() => markAll.mutate()} className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary">
              Marcar todas
            </button>
          ) : null}
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
                  {n.body ? <span className="block truncate font-mono text-xs text-muted-foreground">{n.body}</span> : null}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { profile, isAdmin, isCoach } = useAuthSession()
  const { navigate } = usePageTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)

  const isAppRoute = useMemo(
    () => ["/dashboard", "/users", "/workout", "/routines", "/membership", "/products", "/payments", "/plans"].some((p) => pathname.startsWith(p)),
    [pathname],
  )

  if (!isAppRoute) return null

  const profileHref = profile?.id ? `/users/profile/${profile.id}` : "/dashboard"

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-black text-black">G</span>
        <span className={cn("whitespace-nowrap font-sans text-sm font-black uppercase tracking-wider text-foreground transition-opacity duration-200", collapsed && "opacity-0")}>Gymulate</span>
      </div>

      <div className="px-2 py-2">
        <SidebarNotifications collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.adminOnly && !isAdmin) return false
            if (item.coachOrAdmin && !(isAdmin || isCoach)) return false
            return true
          })
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title} className="mb-6">
              <p className={cn("mb-2 truncate px-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-opacity duration-200", collapsed && "opacity-0")}>{section.title}</p>
              <div className="flex flex-col gap-1">
                {visibleItems.map((item) => {
                  const href = item.href === "/users/profile/me" ? profileHref : item.href.replace("/users/profile/me/routine", profileHref + "/routine")
                  const isActive =
                    href === "/"
                      ? pathname === "/"
                      : item.label === "Mi perfil"
                        ? pathname === profileHref
                        : item.label === "Mis Rutinas"
                          ? pathname === profileHref + "/routine"
                          : item.label === "Usuarios"
                            ? pathname.startsWith("/users") && !pathname.startsWith("/users/profile")
                            : pathname === href || pathname.startsWith(href + "/")
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label + href}
                      onClick={() => {
                        navigate(href)
                        setMobileOpen(false)
                      }}
                      aria-label={item.label}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left font-sans text-sm font-medium transition-colors",
                        isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className={cn("truncate transition-opacity duration-200", collapsed && "opacity-0")}>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        {profile ? (
          <div className={cn("flex items-center gap-3 overflow-hidden rounded-lg border border-primary/20 bg-secondary/30 px-3 py-2.5 transition-all duration-200", collapsed && "flex-col gap-2 px-2 py-2")}> 
            <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
              <AvatarImage src={profile.avatar ?? undefined} alt={profile.first_name ?? "U"} />
              <AvatarFallback className="bg-primary/15 text-xs font-black text-primary">
                {(profile.first_name?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn("min-w-0 flex-1 transition-opacity duration-200", collapsed && "hidden opacity-0")}> 
              <p className="truncate text-sm font-semibold text-foreground">{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Usuario"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        ) : null}
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            navigate("/auth/login")
          }}
          className={cn("mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-medium text-muted-foreground", "transition-colors hover:bg-destructive/10 hover:text-destructive")}
        >
          <LogOut className="h-4 w-4" /> <span className={cn("transition-opacity duration-200", collapsed && "opacity-0")}>Cerrar sesión</span>
        </button>
        <button onClick={() => navigate("/settings")} className={cn("flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground")}> 
          <Settings className="h-4 w-4" /> <span className={cn("transition-opacity duration-200", collapsed && "opacity-0")}>Configuración</span>
        </button>
      </div>
    </div>
  )

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
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button aria-label="Cerrar" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 flex w-72 max-w-[80vw] flex-col bg-card shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            {SidebarContent}
          </div>
        </div>
      ) : null}

      {/* Desktop aside colapsable: iconos siempre; al hover se expande */}
      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {SidebarContent}
      </aside>
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppRoute = ["/dashboard", "/users", "/workout", "/routines", "/membership", "/products", "/payments", "/plans"].some((p) => pathname.startsWith(p))
  if (!isAppRoute) return <>{children}</>
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  )
}
