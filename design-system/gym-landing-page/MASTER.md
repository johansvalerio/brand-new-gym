# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Gym Landing Page
**Updated:** 2026-08-21
**Category:** Fitness/Gym App

---

## Project Architecture (Screaming Architecture)

```
src/
├── app/                      # Next.js 16 App Router (pages, layout, error, robots, sitemap)
│   ├── page.tsx              # Landing
│   ├── users/  products/     # Admin pages (thin wrappers over _features)
│   └── auth/                 # Login
├── _features/                # Feature modules — the real structure
│   ├── gym-landing/          # Landing sections (hero, pricing, gallery, FinalCTA...)
│   ├── gym-admin/            # users/ and products/, each with components/ + hooks/
│   ├── auth/                 # useAuthSession hook + login UI
│   └── shared/               # FloatingNav, PageTransitionOverlay, usePageTransition
├── components/
│   ├── ui/                   # shadcn-style primitives
│   └── providers/            # QueryProvider, AppToaster
├── lib/supabase/             # client.ts (browser), server.ts
└── types/database.types.ts   # GENERATED from Supabase — single source of truth for types
```

**Rules:**
- New feature → new folder under `_features/<name>/` with `components/` and `hooks/`. `shared/` only for cross-feature code.
- **Component granularity (2026-08-23, applies to ALL new code):** one concern per file. A page/feature composes SEPARATE component files — never pile multiple sections/widgets into a single `.tsx`. Canonical example: `dashboard/components/` → `Dashboard.tsx` (orchestrator: guard + hooks + data derivation) composing `dashboard-stats.tsx`, `expiring-members.tsx`, `pending-payments.tsx`. Parent fetches via hooks and passes props down; children stay presentational (or own their small mutations). `payments/` and `membership/` already follow this split (stats / card / history files). Legacy monoliths still pending: Users.tsx, Products.tsx.
- Page files in `app/` stay thin: they render the feature component.
- Never hand-edit `database.types.ts`; regenerate it from the DB and derive row/DTO types from `Tables` / `TablesInsert` / `TablesUpdate`.

---

## Data Layer — Supabase

**Tables:**

| Table | Key columns | Notes |
|---|---|---|
| `public.users` | `id`, `auth_id` (→ auth.users), `email`, `role`, `coach_id`, `plan_id`, `membership_status/start/end` | Profile per auth user; `role` enum `user_role`: **`admin` \| `user` \| `coach`** (NOT "member"); `coach_id` self-FK (one active coach, trigger enforces role='coach'); `plan_id` FK → `plans`; `membership_status` enum active/inactive/pending/expired; start/end = cached current period (fills the profile countdown). The old `membership_plan` enum is DROPPED (2026-08-22). |
| `public.plans` | `id`, `slug` unique, `name`, `duration_days`, `price` (colones CRC), `is_active` | Membership plans seeded: diario ₡2.500 (1d) / semanal ₡10.000 (7d) / mensual ₡15.000 (30d). Editable via SQL by admin (no CRUD UI yet). `handle_new_user()` recreated without the dropped column. |
| `public.products` | `product_id`, `product_name`, `product_price`, `product_stock`, `category_id` | All columns prefixed `product_`; `category_id` FK → `categories.id` (nullable) |
| `public.categories` | `id`, `slug` unique, `name` | Product taxonomy; `slug` = URL-safe identifier (queries/filters), `name` = human label (renamable). Seeded with 6 categories (proteinas, creatina, pre-entreno, vitaminas, accesorios, ropa). |
| `public.exercises` | `name` unique, `muscle_group`, `equipment` | Exercise catalog, seeded (~20) |
| `public.routines` | `user_id` FK, `created_by` FK (author), `goal` enum `routine_goal`, `is_active`, `is_shared` | **Badge provenance**: `created_by === user_id` → self-made ("Tu rutina"), else coach/admin-authored ("De tu coach"). `is_shared=true` publica la rutina en `/routines`; solo el autor (o admin) puede compartirla (trigger `prevent_unauthorized_share`) |
| `public.payments` | `user_id`, `plan_id`, `amount` (snapshot CRC), `method` sinpe/efectivo, `status` pending/approved/rejected, `requested_at/decided_at/decided_by`, `note` | Solicitudes sin pasarela: el usuario crea la solicitud (una pendiente máx — índice parcial único), el admin aprueba/rechaza desde `/payments`. Trigger de aprobación llama `activate_membership()` (acumula sobre vigencia activa) y sella decided_at/by. **Delegación (2026-08-24): los forms de usuario YA NO asignan planes** — todo plan se asigna vía pagos; el admin registra walk-ins con "Registrar pago" en /payments (dialog miembro+plan+método+nota → INSERT directo approved → activación instantánea; RLS insert permite admin para cualquier usuario) |
| `public.notifications` | `user_id`, `type`, `title`, `body`, `link`, `read` | Solo las escriben triggers security-definer (`notify()`): pago solicitado→admins, decisión→solicitante, coach asignado↔miembro, vencimiento próximo→usuario (cron). Realtime via publication + RLS propia por usuario. Bell en FloatingNav con badge |
| `public.routine_days` | `routine_id` FK, `day_index` 1-7, `focus` | unique(routine_id, day_index) |
| `public.routine_exercises` | `day_id` FK, `exercise_id` FK, sets, reps, rest_seconds | Ordered by `order_index` |
| `public.routine_votes` | `routine_id` FK, `user_id` FK, unique(routine_id, user_id) | Like-style voting; 1 voto por usuario por rutina; autor no puede votarse a sí mismo (RLS) |

**Environment:** `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Browser access via `createClient()` from `@/lib/supabase/client`.

**DB-level guards (triggers — verified 2026-08-22):**
- `prevent_sensitive_changes`: users can't self-change `role`/`email` (is_admin bypass). Blocks even direct SQL without admin claims.
- `validate_coach_role`: `coach_id` must reference a row with `role='coach'`.
- Own-profile UPDATE policy additionally pins `role` AND `coach_id` (no self-escalation).

**RLS model (verified in DB — simulation matrix passed with JWT claims):**

| Table | Policy | Access |
|---|---|---|
| users | "Users can view/insert/update own profile" | `auth.uid() = auth_id`; role + coach_id pinned (no self-escalation) |
| users | "Admins can view/update/insert/delete all users" | `is_admin()` |
| users | "Coaches can view users" | `is_coach()` |
| products / exercises | viewable by everyone / editable by admin | SELECT `true` / ALL `is_admin()` |
| categories | viewable by everyone / editable by admin | SELECT `true` / ALL `is_admin()` |
| plans | viewable by everyone / editable by admin | SELECT `true` / ALL `is_admin()` |
| payments | dueño ve las suyas / admin todo; INSERT forzado a propio; DELETE propio-pending | UPDATE status solo admin → trigger activa membresía |
| notifications | solo propias (SELECT/UPDATE read) | INSERT exclusivo de triggers security-definer |
| routines | viewable by owner, admin and coach | owner (by `auth_id`) OR `is_admin()` OR `is_coach()` |
| routines | shared viewable by everyone | `is_shared = true` |
| routines | writable by admin, coach or self | admin/coach any; user only own `user_id` |
| routine_votes | viewable by everyone / votable rules | SELECT `true`; INSERT solo voto propio sobre rutina compartida ajena; DELETE solo voto propio |
| routine_days / routine_exercises | inherit routine visibility/writability | subquery through `routines` → owner/admin/coach |

**DB-level guards for sharing/voting:** trigger `prevent_unauthorized_share` (only author or admin can set `is_shared=true`); vote INSERT policy pins `user_id` to the caller's profile and blocks self-votes.

> **Golden rule:** the frontend guard (`isAdmin` hiding UI) is cosmetic. Real protection lives in these RLS policies. Any new table or privileged column must ship with its policy — not just a hidden button.

---

## State & Data Fetching — TanStack Query v5

**Provider:** `src/components/providers/query-provider.tsx` — defaults: `staleTime: 60_000`, `refetchOnWindowFocus: false`, `retry: 1` (queries) / `retry: 0` (mutations). Devtools included.

**Conventions (replicate exactly in new features):**

1. **Query keys factory** per entity:
   ```ts
   export const userKeys = {
     all: ["users"] as const,
     detail: (id: string) => ["users", id] as const,
   }
   ```
2. **One hooks file per feature** (`_features/<x>/hooks/use<X>.ts`) exporting `use<X>`, `useCreate<X>`, `useUpdate<X>`, `useDelete<X>`.
3. **Mutations** run Supabase calls, throw on `error`, invalidate `keys.all` on success.
4. **Optimistic deletes** — canonical pattern (snapshot → remove → rollback):
   ```ts
   onMutate: async (item) => {
     await queryClient.cancelQueries({ queryKey: keys.all })
     const previous = queryClient.getQueryData<Row[]>(keys.all)
     queryClient.setQueryData<Row[]>(keys.all, (old) => old?.filter((r) => r.id !== item.id) ?? old)
     return { previous }
   },
   onSuccess: (_, item) => toast.success(...)          // no invalidate here
   onError: (error, item, ctx) => {
     if (ctx?.previous) queryClient.setQueryData(keys.all, ctx.previous)
     toast.error(...)
   },
   onSettled: () => queryClient.invalidateQueries({ queryKey: keys.all })
   ```
5. Delete hooks receive the **full row** (not just the id) so toasts can show the entity name.

---

## Feedback System — Sonner Toasts

**Mount:** `<AppToaster />` (root layout) → `position="top-right"`, Lucide icons (`CheckCircle2` success / `XCircle` error). Styles live in `globals.css` under `/* Sonner toasts: tactical neon */`.

**Rules:**
- Toasts fire **in the hooks** (`onSuccess` / `onError`), never in components.
- Success: `toast.success(\`Usuario "${name}" creado correctamente\`)` — include the entity name.
- Error: `toast.error("No se pudo crear el usuario", { description: error.message })` — always surface Supabase's message.

**Visual spec (already in CSS — keep consistent):**

| Element | Spec |
|---|---|
| Surface | `#09090B`, border `#1A1A1A`, radius 8px, dark drop shadow |
| Success | left 3px bar `#96D906` + green glow + green icon (border stays neutral) |
| Error | left 3px bar `#EF4444` **+ red-tinted border** + red icon |
| Title | Geist Sans 12px, uppercase, tracking 0.06em, white |
| Description | Geist Mono 12px, `#A1A1AA` |

---

## Authentication & Route Protection

- **OAuth only** (Google / Facebook). No email+password.
- **`src/proxy.ts`** (runs on document requests): `/users` + `/products` unauthenticated → redirect `/auth/login`; `/auth/login` while authenticated → redirect `/`.
- **`useAuthSession()`** (`_features/auth/hooks/`): session + `isAdmin` / `isCoach` — the role is read from the **DB (`users.role`)**, never from Google's `user_metadata`.
- **Admin menu** in FloatingNav renders `Usuarios` (visible for Admin + Coach) and `Productos` (visible for any authenticated user) items. On `/products`, the "Unidades" and "Valor inv." stats cards, the "Nuevo" button, and the per-row Pencil/Trash actions are admin-only; "Productos" count is visible to any authed viewer. The category filter dropdown is visible to all authed users (mirrors the search bar visibility); CRUD on products stays admin-only.
- **Logout:** `supabase.auth.signOut()` then `navigate('/auth/login')`.

---

## Navigation & Page Transitions

Interactive navigation (buttons, menu items) must use `usePageTransition().navigate(href)` — NOT `router.push` directly. It plays the GSAP curtain exit (`window` event `gsap-page-exit`) and pushes after `TRANSITION_DURATION_MS + 20ms`. Plain `<a>` links are only for in-page hash anchors (landing sections).

---

## Admin Page Pattern (standard anatomy)

Every admin page (`/users`, `/products`, and future ones) follows:

1. **Guard:** `const { isAdmin, loading } = useAuthSession()`; while loading → centered loader; `!isAdmin` → "Acceso restringido" card (stay on page, don't redirect).
2. Ambient glows background + section header (chip + H2 with primary keyword).
3. **Stats row** (3 stat cards) + search input + view toggle (cards/table) + primary "Nuevo" button.
4. Data via feature hooks (TanStack). Loading / empty / error states each get a styled block.
5. CRUD through two dialogs: `FormDialog` (create+edit, syncs from row on open) and `ConfirmDeleteDialog`. All dialogs use `fixed inset-0 z-[100] flex items-center justify-center p-4` (above FloatingNav's z-90) so the panel centers naturally without `pt-24`. See [[dialog-nav-clearance-convention]].

### Member Profile Page (`/users/profile/[id]`)

Thin server page (`PageProps<"/users/profile/[id]">` + `await params`) rendering `_features/gym-admin/profile/components/user-profile.tsx` (client). Data via `useUser(id)` with `userKeys.detail(id)` — the `["users", id]` key invalidated automatically by `keys.all`.

**Access rules:** own profile → always allowed (any role with session, RLS-backed). Admin → any profile + CRUD buttons (`UserFormDialog` + `ConfirmDeleteDialog` reused, not duplicated) + Routine action (Dumbbell icon). Coach → Routine action (Dumbbell icon) only. Non-admin/coach on someone else → "Acceso restringido" card. "Mi perfil" menu item in FloatingNav (needs `profile.id` from `useAuthSession`, which exposes the full own row).

### Shared Routines Page (`/routines`, public)

Thin server page rendering `_features/gym-routines/components/shared-routines.tsx` (client). Data via `useSharedRoutines()` (`sharedKeys.all`) — fetches `is_shared = true` with author join + embedded votes; ranking sorted client-side by vote count desc (ties → newest first). **Like-style voting** (`useToggleVote`, optimistic snapshot→update→rollback): Flame icon filled `fill-primary text-primary` when voted, outline gray otherwise; own routine or no session → non-clickable with explanatory title; NO success toast on votes (social-style silence), error toast only. Empty state: "Aún no hay rutinas compartidas". Entry point: "Ranking de rutinas" (Trophy) in FloatingNav dropdown.

**Routine card menu toggles:** boolean flags use `ToggleRow` (mini switch LEFT, label RIGHT; ON = `bg-primary`, OFF = `bg-secondary`; menu stays open while toggling). `Activa` visible when `canEditRoutine`; `Compartida` visible only to the routine's author (`created_by === viewer.id`). Sharing also shows a "Compartida" badge on the card.

---

## Mobile Conventions (2026-08-22 — applies to admin + routines features)

Desktop is frozen: base classes = mobile (375px baseline), every current desktop size is RESTORED with `sm:`/`md:` variants. Never change what `sm:` and up renders.

1. **Dialogs with forms** (user/product form): panel = `flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden`; body/form = `min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5`; action row = **sticky footer** (`sticky bottom-0 -mx-4 ... border-t bg-card sm:-mx-6`) so submit is always reachable on phones. Routine dialog already used header/fixed-footer pattern.
2. **Confirm-delete dialogs**: `max-h-[85vh] overflow-y-auto p-4 sm:p-6` guard on the panel.
3. **Dialog chrome paddings**: header/footer `px-4 py-3 sm:px-6 sm:py-4`; close button `h-9 w-9 sm:h-8 sm:w-8`.
4. **Tap targets ≥40px on mobile only**: table actions `h-10 w-10 sm:h-8 sm:w-8`, card actions `h-10 w-10 sm:h-9 sm:w-9`, day-editor/menu buttons `h-9 w-9 sm:h-7 sm:w-7`, ToggleBtn `p-2.5 sm:px-3 sm:py-1.5`.
5. **Tables → cards below `sm:`**: Users + Products always render the cards grid on mobile; the table view exists only ≥sm (`<div className={view === "table" ? "sm:hidden" : ""}>` for cards + `<div className="hidden sm:block">` around the table). The cards/table toggle is `hidden sm:flex`.
6. **Stats strips**: `grid-cols-1 sm:grid-cols-3` (never hard grid-cols-3).
7. **Form field grids collapse at base**: pairs → `grid-cols-1 sm:grid-cols-2`; triples → `grid-cols-1 sm:grid-cols-3`. ExerciseEditor uses one grid that reflows: `grid-cols-4 sm:grid-cols-12` (select spans all 4 on mobile; desktop col-spans unchanged).
8. **Icon-only buttons carry aria-labels** ("Nuevo miembro", "Nuevo producto", exercise inputs) since their text labels are hidden below sm.
9. Long strings get mobile-safe truncation: emails `truncate`; routine names on shared ranking `line-clamp-2 sm:truncate`.
10. **Primary toolbar action ("Nuevo") right-aligned at EVERY breakpoint** (`justify-end` on the actions container). Rationale: thumb zone on mobile (FAB convention) + it already sits right beside the view toggle on desktop. Never left-align it on one page and right-align it on another — cross-page consistency wins.
11. **Dense numeric inputs get visible micro-labels** (pattern: ExerciseEditor in the routine dialog): `font-mono text-[9px] uppercase tracking-wider text-muted-foreground` label ABOVE each input via `htmlFor`/`id` pair; placeholders show EXAMPLE VALUES ("3", "8-12", "90"), never repeat the label text. Applies wherever fields are too narrow for inline labels (sets/reps/rest-style rows).


## Development Environment

- **Always `http://localhost:3000`** — never `127.0.0.1` (Next.js 16 blocks cross-origin dev resources from 127.0.0.1 → JS chunks blocked → no hydration → client components like FloatingNav don't render).
- Type-check with `npx tsc --noEmit` (framework owns compilation; this is the verification command).
- Supabase MCP is configured (pinned to this project) for SQL, migrations, and advisors.
- Known leftover: `src/_features/gym-admin/data/mock.ts` references a deleted `../types` — delete it if unused.

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#96D906` | `--color-primary` |
| On Primary | `#000000` | `--color-primary-foreground` |
| Secondary | `#121212` | `--color-secondary` |
| On Secondary | `#96D906` | `--color-secondary-foreground` |
| Accent/CTA | `#96D906` | `--color-accent` |
| Background | `#000000` | `--color-background` |
| Foreground | `#F8FAFC` | `--color-foreground` |
| Muted | `#1A1A1A` | `--color-muted` |
| Muted Foreground | `#A1A1AA` | `--color-muted-foreground` |
| Border | `#1A1A1A` | `--color-border` |
| Destructive | `#EF4444` | `--color-destructive` |
| Ring | `#96D906` | `--color-ring` |

**Color Notes:** Monster Energy Green + black. High-contrast neon green on pure black for a cyberpunk/tactical gym aesthetic.

### Accent Color Usage Patterns

| Accent Type | Usage | Pattern |
|-------------|-------|---------|
| Section Label Chip | Top of every section header | Pill (rounded-full) + border-primary/30 + bg-primary/5 + dot pulse + uppercase mono tracking-[0.2em] |
| Heading Underline | Keyword in heading gets SVG underline accent | `text-primary` + `relative inline-block` + absolute curved SVG path stroke |
| Gradient Rings | Section dividers | 1px h-gradient from-transparent via-primary/30 to-transparent |
| Corner Icons (optional) | Decorative in corner of feature sections | opacity-20 + w-12/h-12 + 3s bounce or 2s pulse |

---

### Background Layer System (Screaming Architecture)

Every section MUST include layered backgrounds in this z-order (bottom → top):

1. **Base color:** `bg-background` or `bg-card` — solid foundation
2. **Ambient glows:** 2–4 radial gradient blobs (`blur-[100-140px]`, `bg-primary/5-10`), positioned in opposite corners
3. **Grid/Pattern (optional):** Dotted or lined grid with `opacity-[0.03]`, primary-colored (rgba(150, 217, 6, 1))
4. **Vertical lines (CTA only):** 4–6 vertical 1px lines at intervals, gradient fade top/bottom, `via-primary/10-20`
5. **Radial spotlight (optional):** Mouse-tracking or centered radial at `primary/15-20`
6. **Vignette:** `bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_75%)]` at 40–60% opacity for dark immersive sections

**Order:** All background layers use `pointer-events-none absolute inset-0 z-0` through z-5; content sits at `relative z-10` minimum.

---

### Section Header Anatomy

Every section header follows this exact vertical stack (centered OR left-aligned):

```
[Section Label Chip]  →  mb-4 to mb-6
[H2 Heading]          →  font-heading font-black uppercase tracking-tighter
                        text-4xl md:text-6xl leading-[0.9-0.95] mb-4 to mb-6
                        → Primary keyword inside: <span class="text-primary"> + SVG underline
[Description P]       →  font-mono text-muted-foreground text-lg max-w-2xl leading-relaxed
```

**H2 Scale Levels:**
- Feature/Pricing: 4xl md:6xl
- Immersive/Climax: 5xl sm:6xl md:7xl lg:8xl

---

### Typography

- **Heading Font:** Geist Sans (via `--font-geist-sans` / `font-heading`)
- **Body Font:** Geist Mono (via `--font-geist-mono` / `font-mono`)
- **Mood:** cyberpunk, neon, tactical, dark, monster energy green, high-contrast
- **Loaded via:** `next/font/google` in `src/app/layout.tsx`

**CSS Variables:**
```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
--font-heading: var(--font-sans);
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #96D906;
  color: #000000;
  padding: 12px 24px;
  border-radius: 0; /* rounded-none */
  font-weight: 600;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #96D906;
  border: 2px solid #96D906;
  padding: 12px 24px;
  border-radius: 0;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #09090B;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #1A1A1A;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #96D906;
  outline: none;
  box-shadow: 0 0 0 3px #96D90620;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: #09090B;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

### Card Tier System: Pricing Cards (3-Column Layout)

| Layer | Treatment |
|-------|-----------|
| **Container** | `relative overflow-hidden group cursor-pointer` + base gradient accents per tier |
| **Glow** (hover) | `-top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700` colored per tier |
| **Icon** (tier) | Top-left: `p-3 rounded-xl transition-all duration-500` — hover fills to solid bg with icon color swap |
| **Badge** (featured only) | `-translate-y-1/2` with `animate-pulse` halo underneath + uppercase 10px tracking-[0.2em] |
| **Price** | `text-6xl font-black leading-none` + color shift to primary on card hover |
| **Divider** | Gradient 1px line: `from-transparent via-border to-transparent` + mx-6 |
| **Features** | `space-y-3.5` + rounded-full check icon bg: `primary/15` → `primary/25` on item hover |
| **Footer CTA** | `h-14 w-full` + arrow icon that translates +x on group hover |
| **Inter-card** | Sibling scale interplay: hovered = `scale-[1.02] z-20`, adjacent = `scale-[0.98] opacity-80 z-0`, rest = `scale-100 z-10` with 500ms ease-out |
| **GSAP In** | `y:60, opacity:0, duration:0.7, stagger:0.18, ease:power3.out, scrollTrigger@top 75%` |
| **Featured lift** | `md:-mt-4 md:mb-4` so middle card sits above neighbors |
| **Trust line** | Below grid: centered mono text with horizontal dashes as separators |

---

### Equipment Section — 3D Coverflow Carousel

The equipment showcase (`EquipmentCarousel.tsx`) uses the **CoverflowCarousel** primitive (`components/ui/coverflow-carousel.tsx`, adapted from 21st.dev): a 3D rake of cards (rotateY + translateZ with distance falloff), infinite loop without DOM cloning, drag with flick inertia, keyboard arrows, dots, and per-slide caption (title + subtitle).

- **Exception (user decision 2026-08-22):** this section's header has **NO chip/pill** above the H2 — the heading speaks alone. All other sections keep the chip pattern.
- **Active card styling** comes from the `data-active` attribute painted by the engine: non-active cards `grayscale` + neutral border; active card full color + `border-primary/60` + green glow. Reuse this convention for any future coverflow instance.
- Cards: `rounded-xl`, width via `cardWidth="clamp(200px, 26vw, 320px)"` (responsive by clamp).
- Layered background per the global rules (2 ambient glows + hairline); entrance via GSAP ScrollTrigger (`y:40, stagger 0.15, power3.out`), respects `prefers-reduced-motion`.

### Fan Deck Cards (Equipment / Gallery Layout)

Default arrangement: cards stacked in a slight fan centered on the middle card.

| State | Transform Rule |
|-------|---------------|
| **Idle (stacked)** | Each card offset by distance from center: `rotateZ(distance*2.5deg) translateX(distance*12px) translateY(abs(distance)*4px)` |
| **Hovered card** | `rotateZ(0) + scale(1.04) + translateY(-18px)` + z-100 + border-primary + shadow-2xl shadow-primary/30 |
| **Siblings LEFT of hover** | Additional `translateX(-55*spread -20px)` and `rotateZ -= spread*2deg` per step away |
| **Siblings RIGHT of hover** | Additional `translateX(+55*spread +20px)` and `rotateZ += spread*2deg` per step away |
| **Transition** | `all 650ms cubic-bezier(0.22, 1, 0.36, 1)` — smooth springy overshoot |

**Card Interior:**
- 4/5.2 aspect ratio + dark gradient base `#1a1f2e→#0f141e`
- Tiny grid overlay via `mix-blend-overlay` at 24px size + opacity 80
- Image: default `grayscale opacity-50 scale-100` → hover `grayscale-0 opacity-100 scale-110`, duration 700ms
- Category chip top-left, arrow pulse badge top-right (only on hover)
- Bottom gradient: default 0,0,0 85%→30%→0; hover deepens to 92%→50%→5%→0
- Title scales: base md:text-lg → hover md:text-2xl
- Description: `max-h-0 opacity-0 mt-0` → `max-h-24 opacity-100 mt-3` with 500ms ease-out
- Progress bar (bottom, only hover): width 0%→100% gradient `primary→secondary` 1000ms ease-out

**Mobile fallback:** Horizontal snap-x scroll (overflow-x-auto) with cards at w-[85%].

---

### Hero Section Spec

| Element | Spec |
|---------|------|
| **Container** | `relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background` |
| **Background image** | Unsplash gym image, `bg-cover bg-center bg-no-repeat`, `opacity-25 filter grayscale mix-blend-overlay` (slightly visible, dark) |
| **Overlay** | `bg-gradient-to-b from-background/40 to-background` — darkens top, fades to solid black at bottom |
| **Ambient glow** | Centered `bg-primary/10 blur-[120px]` behind content |
| **H1** | `font-heading text-5xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9]` — keyword in `text-primary` |
| **Description** | `font-mono text-muted-foreground text-lg md:text-2xl max-w-2xl` |
| **CTA buttons** | Primary: `bg-primary text-primary-foreground rounded-none font-heading tracking-wider uppercase` + Secondary: `border-border text-foreground hover:bg-secondary/10` |
| **GSAP In** | h1: y:50 opacity:0 0.8s power3.out → p: y:20 opacity:0 0.6s power2.out → buttons: scale:0.8 opacity:0 0.5s back.out(1.7) |

---

### Final CTA Section Spec (Climax Pattern)

| Element | Spec |
|---------|------|
| **Padding** | py-36 + border-t border-border/60 mt-12 |
| **Spotlight** | Mouse-tracking radial gradient: `radial-gradient(circle at ${x}% ${y}%, primary/18 0%, transparent 50%)` |
| **Hero Badge** | Chip with `animate-ping` dot + "Limited Spots Available" uppercase mono at 11px 0.3em tracking |
| **H2** | Split words in overflow-hidden blocks, each word animated separately via GSAP: y:80 stagger 0.08 power4.out |
| **Keyword skew highlight** | One word inside span with `-skew-x-12` blurred bg accent behind text |
| **Desc** | Two-line: first line muted, second slightly brighter (foreground/70) |
| **Main CTA** | `group` wrapper with `-inset-1 gradient-to-r blur-lg` ring that fades in on hover → 0→60% opacity. Button: h-16→20 md, ring-2 ring-offset-4, hover scale-[1.03], shine sweep `translate-x-full` 1000ms on hover |
| **Trust row** | Members avatars (-space-x-2) + star rating + security lock; separated by muted dots on md+, stacked on mobile |
| **Decoratives** | Corner dumbbell (top-left, bounce 3s) + flame (bottom-right, pulse 2s), both opacity-20 |
| **Background accents** | 3 ambient glows (center primary, upper-right secondary, lower-left accent) + 6 vertical gradient lines + SVG grid pattern 3% opacity |

---

### Story/Pinned Text Section Spec

| Layer | Spec |
|-------|------|
| **Container** | `relative bg-black overflow-hidden` + `h-screen` inner wrapper |
| **Constellation BG** | Canvas-based: 60 particles distributed randomly. Each particle: position + velocity drift, twinkle opacity, glow halo (3.5× size radial gradient). Connection lines between 1-2 nearest neighbors at <22% vp distance with alpha falloff. All rotates very slowly. Canvas sits at z-1. |
| **Glow** | Centered w-[60vw] h-[40vh] primary/10 blur-[120px] (z-0) |
| **Vignette** | `radial-gradient ellipse_at_center transparent→#000@75%` opacity-50 (z-0) |
| **Text layer** | z-20 — sits on top of particles |
| **Phrases** | Pinned GSAP timeline: phrases enter from -120% left, center with word stagger color white→green (#96D906), hold, exit to +120% right. Last phrase holds (no exit). |
| **Word style** | font-heading font-black uppercase whitespace-nowrap, size clamp(4rem,11vw,11rem), subtle primary text-shadow at 8% opacity |
| **Scroll Trigger** | `start:top top, end:+=phrases*900, scrub:2, pin:true` |

---

## Style Guidelines

**Style:** Vibrant & Block-based

**Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling + Screaming Architecture

**Screaming Architecture Principle:** Every section is a self-contained "scene" with its own:
- Layered background system (glows + patterns + optional spotlight)
- Independent GSAP scrollTrigger entrance animation
- Distinctive micro-interaction signature (hover interplay, fan spread, spotlight follow)
- Optional particle/canvas enhancement for hero/pinned sections
- Trust/social proof row at climax sections

- **Conversion Strategy:** Narrative increases time-on-page 3x. Use progress indicator. Mobile: simplify animations.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** 1. Intro hook, 2. Chapter 1 (problem), 3. Chapter 2 (journey), 4. Chapter 3 (solution), 5. Climax CTA
- **Section Gap:** Consistent `py-24` to `py-28` for standard, `py-32` to `py-36` for climax/immersive sections
- **Container Width:** Standard `max-w-6xl` for content rows, `max-w-7xl` for feature showcases with expanded cards, `max-w-5xl` for CTAs

---

### Motion Easing Reference

| Use Case | Duration | Easing |
|----------|----------|--------|
| Micro hover (icon, color shift) | 200–350ms | `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)` |
| Card interplay (scale, translate) | 500–650ms | `cubic-bezier(0.22, 1, 0.36, 1)` — springy arrival |
| Fan deck (spread/rotate + neighbors) | 650ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| GSAP entrance (y + opacity) | 600–800ms | `power3.out` |
| Hero word stagger | 800–900ms | `power4.out` |
| Button bounce entrance | 600ms | `back.out(1.7)` |
| Scroll scrub pinned | per section | scrub: 2 (smoother), scrub: 1 (tighter) |
| Description reveal max-h | 500ms | `ease-out` |
| Progress bar fill | 1000ms | `ease-out` |

---

## Anti-Patterns (Do NOT Use)

- ❌ Static design
- ❌ No gamification

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout (use isolated transforms)
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Naked sections** — No section without at least 2 ambient glows in background
- ❌ **Inconsistent headers** — Every section header MUST use the chip + H2 (+SVG underline) + description pattern
- ❌ **Abrupt motion** — Never use linear easing; always cubic-bezier or power curves
- ❌ **Desktop-only motion** — Any complex fan/canvas effect needs a simplified mobile fallback
- ❌ **Empty trust** — Climax CTAs MUST include social proof row (members, rating, guarantees)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Every section has background layer system (≥2 ambient glows)
- [ ] Section headers use chip + H2(+underline) + description pattern
- [ ] Complex hover/fan effects have simplified mobile (<768px) fallback
- [ ] Motion easing uses power/cubic-bezier, never linear
- [ ] Card hover interplay uses transform + z-index (no layout shift)
- [ ] Canvas/particle effects stop when offscreen (RAF cleanup in useEffect return)
- [ ] Climax CTA has social proof row
- [ ] All sections have independent GSAP scrollTrigger entrance
- [ ] CRUD mutations fire Sonner toasts in the hooks (success with entity name, error with `error.message`)
- [ ] New tables/columns: RLS policy included + `database.types.ts` regenerated + types derived (`Tables`/`TablesInsert`/`TablesUpdate`)
- [ ] TanStack hooks follow the keys-factory + invalidate (+ optimistic delete) conventions
- [ ] Interactive navigation uses `navigate()` (page transition), not raw `router.push`
- [ ] `npx tsc --noEmit` passes; app verified at `http://localhost:3000`