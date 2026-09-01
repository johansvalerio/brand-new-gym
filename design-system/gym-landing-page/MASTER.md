# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Gym Landing Page + App (Monster Energy)
**Updated:** 2026-08-31 — React 19.2.8 / Next 16.3.0 / Supabase SSR / TanStack Query v5 / Zod 4.5.4
**Category:** Fitness/Gym App
**Stack:** `react:19.2.8` `next:16.3.0` `tailwindcss:4` `@base-ui/react:1.7` `@supabase/ssr:0.12.4` `zod:4.5.4`

---

## Project Architecture (Screaming Architecture)

```
src/
├── app/                      # Next.js 16 App Router (proxy.ts = middleware)
│   ├── layout.tsx            # Root SSR layout: fetches session/profile via supabase/server.ts → AuthProvider
│   ├── page.tsx              # Landing
│   ├── users/  products/     # Admin pages (thin wrappers over _features)
│   ├── plans/  payments/     # Admin: CRUD planes / pagos
│   ├── routines/             # Rutinas compartidas (público)
│   ├── workout/              # Sesión de entrenamiento (registrar series)
│   └── auth/                 # Login + callback
├── _features/                # Feature modules — the real structure
│   ├── gym-landing/          # Landing sections (hero, pricing, gallery, FinalCTA...)
│   ├── gym-admin/            # users/ products/ payments/ membership/ plans/ dashboard/
│   │   ├── lib/              # zod schemas: user.schema.ts, product.schema.ts, plan.schema.ts, payment.schema.ts
│   │   ├── users/components/ # Users.tsx, user-form-dialog.tsx (key remount), users-table/card/toolbar
│   │   └── payments/         # Payments.tsx, walk-in-payment-dialog.tsx
│   ├── gym-coach/            # dashboard del coach
│   ├── gym-member/           # dashboard del miembro
│   ├── gym-routines/         # rutinas
│   │   ├── components/routine-form/  # dialog.tsx, shell.tsx, chrome.tsx, form-body.tsx, context.tsx (wizard)
│   │   │   └── routine-form-types.ts + routine-form-data.ts + routine.schema.ts
│   │   ├── components/user-routines/ # UserRoutines.tsx (assembly PascalCase al lado de user-routines/ routine-card.tsx, day-panel.tsx, card-menu.tsx, empty-state.tsx), index.tsx eliminado 2026-09-01
│   │   └── lib/              # routine.schema.ts (zod) — metadata/structure/full + zodToWizardErrors
│   ├── gym-checkin/          # check-in diario
│   ├── gym-workout/          # registro entrenamientos (workout_logs/set_logs via RPC save_workout)
│   ├── auth/                 # useAuthSession (wrapper sobre AuthProvider context)
│   └── shared/               # FloatingNav, PageTransitionOverlay, usePageTransition, useBodyScrollLock, useNow
├── components/
│   ├── ui/                   # shadcn-style primitives sobre @base-ui/react (button/card/dialog/dropdown-menu/input/select/table/tabs/badge/carousel/coverflow/progress/skeleton/separator/avatar)
│   └── providers/            # QueryProvider, AppToaster, AuthProvider (SSR)
├── lib/supabase/             # client.ts (browser createBrowserClient), server.ts (createServerClient con next/headers cookies)
└── types/database.types.ts   # GENERATED — single source for Tables/TablesInsert/TablesUpdate (never hand-edit)
opencode.json                 # MCP: supabase (project wknacbyqqpsvswjhwrbx), context7, github
```

**Rules:**
- New feature → new folder under `_features/<name>/` with `components/` and `hooks/` + `lib/*.schema.ts` for zod. `shared/` only for cross-feature code.
- **Component granularity (2026-09-01, applies to ALL):** one concern per file. Monolitos eliminados: `routine-form-dialog.tsx:510` → `routine-form/dialog|shell|chrome|form-body|context`, `user-routines.tsx:707` → `UserRoutines.tsx` + `user-routines/routine-card|day-panel|card-menu|empty-state`. `shared-routines.tsx` → `SharedRoutines.tsx`, `workout-session.tsx` → `WorkoutSession.tsx`, `user-profile.tsx` → `UserProfile.tsx` (todos PascalCase assembly al lado de granulares kebab). `dashboard/components/` ya cumplía (`Dashboard.tsx` router → `admin-dashboard.tsx` orquestador → `dashboard-stats` etc.). Barrels `routine-form-dialog.tsx` solo re-exporta — nuevo código importa desde `UserRoutines.tsx`/`SharedRoutines.tsx`/`WorkoutSession.tsx`.
- **Body scroll lock en diálogos:** todo dialog llama `useBodyScrollLock(open)` (`shared/hooks/useBodyScrollLock.ts`) — congela scroll fondo. Confirm-deletes con `Boolean(entity)`.
- **Z-index global (2026-08-31):** `FloatingNav` `z-90` → **todos los modals/dialogs `z-[100]`** (`routine-form/form-body.tsx:95` `fixed inset-0 z-[100]`, `chrome.tsx:18` loader `z-[100]`, `user-form-dialog.tsx:53`, `product-form-dialog`, `confirm-delete-dialog`, `own-profile-dialog.tsx:39` + `Dialog` primitives `dialog.tsx:26` `z-[100]` + `product-detail-modal.tsx:71` `Dialog z-[100]`) → `PageTransitionOverlay` `z-[9999]`. Nunca `z-50` para modals o quedan debajo del nav. Product detail modal también respeta `z-[100]` para quedar por encima del nav como rutinas.
- **Anti set-state-in-effect:** nunca `useEffect(()=> setState(...),[open,product])` para sync form. Usar `key={entity?.id ?? "new"}` que remonta `Inner` con `useState(()=> entity ? {...} : emptyForm)` lazy. Únicos effects permitidos: `Escape` listener, `focus` timeout, `auth.onAuthStateChange` suscripción. `carousel.tsx` `onSelect(api)` es excepción documentada con `eslint-disable`.
- Page files in `app/` stay thin: they render the feature component. `layout.tsx` es **async Server** que pasa `initialSession/initialProfile` a `AuthProvider`.
- Never hand-edit `database.types.ts`; regenerate it from the DB and derive row/DTO types from `Tables` / `TablesInsert` / `TablesUpdate`.

---

## Data Layer — Supabase

**Tables:**

| Table | Key columns | Notes |
|---|---|---|
| `public.users` | `id`, `auth_id` (→ auth.users), `email`, `role`, `coach_id`, `plan_id`, `membership_status/start/end` | `role` enum `admin\|user\|coach`; `coach_id` self-FK `ON DELETE SET NULL`; `plan_id` FK → `plans`; `membership_status` active/inactive/pending/expired. `membership_plan` enum DROPPED 2026-08-22. |
| `public.plans` | `id`, `slug` unique, `name`, `duration_days`, `price` CRC, `is_active` | Diario ₡3.000 / semanal ₡10.000 / mensual ₡15.000. CRUD `/plans` admin-only 2026-08-28: `slug` AUTOGENERA al crear (`slugify`), al editar no cambia. |
| `public.products` | `product_id`, `product_name`, `product_price`, `product_stock`, `category_id` | Prefixed `product_`; `category_id` FK → `categories.id` nullable |
| `public.categories` | `id`, `slug` unique, `name` | 6 categorías seeded |
| `public.exercises` | `name` unique, `muscle_group`, `equipment`, `image_url` | Catalog ~30 con `image_url` local `/exercises/*.jpg` |
| `public.routines` | `user_id` FK `CASCADE`, `created_by` FK `SET NULL` (2026-08-31 fix), `goal` enum, `is_active`, `is_shared` | `created_by===user_id` → "Tu rutina", else coach. `is_shared` solo autor/admin (trigger `prevent_unauthorized_share`). `created_by` nullable tras delete del creador (rutina huérfana muestra "Asignada"). |
| `public.payments` | `user_id` FK `CASCADE`, `plan_id` FK, `amount` snapshot, `method` sinpe/efectivo, `status` pending/approved/rejected, `decided_by` FK `SET NULL` (2026-08-31 fix) | Una pendiente máx por usuario (índice parcial). Trigger aprobación `activate_membership()` acumula. Walk-in `status approved` directo. |
| `public.notifications` | `user_id` FK `CASCADE`, `type`, `title`, `body`, `link`, `read` | Solo triggers `security-definer` `notify()` + Realtime. |
| `public.routine_days` | `routine_id` FK `CASCADE`, `day_index` 1-7, `focus` | unique(routine_id, day_index) |
| `public.routine_exercises` | `day_id` FK `CASCADE`, `exercise_id` FK `RESTRICT`, sets, reps, rest_seconds | Ordered by `order_index` |
| `public.routine_votes` | `routine_id` FK `CASCADE`, `user_id` FK `CASCADE`, unique | 1 voto por usuario, autor no vota (RLS) |
| `public.check_ins` | `id`, `user_id` FK `CASCADE`, `check_in_date` (tz CR), `checked_in_at` | unique(user_id, check_in_date) |
| `public.workout_logs` | `id`, `user_id` FK `CASCADE`, `routine_id` FK `SET NULL`, `routine_day_id` FK `SET NULL`, `started_at`, `completed_at` | `completed_at=NULL` = en curso |
| `public.set_logs` | `id`, `workout_log_id` FK `CASCADE`, `exercise_id` FK, `set_number`, `weight` kg, `reps`, `is_warmup` | Hereda RLS del `workout_log` padre |
| `public.product_sales` | `id`, `product_id` FK `RESTRICT`, `buyer_id` FK `RESTRICT`, `quantity`, `unit_price`, `total=unit_price*qty` CHECK, `status` pending/approved/rejected, `sold_by`, `payment_id` | Flujo mostrador: `pending` no descuenta stock; `approved` descuenta via `handle_product_sale_stock` BEFORE; RLS `self pending INSERT` + `admin ALL`. Stats solo `approved`. |

**Environment:** `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`sb_publishable_...` nuevo) + `SUPABASE_ACCESS_TOKEN` `sbp_...` para MCP. Browser via `createBrowserClient`, Server via `createServerClient` (`lib/supabase/server.ts` con `cookies()` `next/headers`).

**DB-level guards (triggers):**
- `prevent_sensitive_changes`: users can't self-change `role`/`email` (is_admin bypass).
- `validate_coach_role`: `coach_id` must be `role='coach'`.
- Own-profile UPDATE pins `role`, `coach_id`, `membership_status/start/end`, `plan_id` (no auto-activación; corre vía `activate_membership()`).

**DB-level functions (SECURITY DEFINER, solo `authenticated` salvo helpers):**
- `copy_shared_routine(source_routine_id)` → copia cabecera+días+ejercicios, valida `auth.uid()`, bloquea propia/no-compartida. Solo `authenticated`.
- `save_workout(p_routine_id, p_routine_day_id, p_notes, p_sets jsonb)` → transacción `workout_log`+`set_logs`, valida ≥1 serie. Solo `authenticated`.
- Helpers `is_admin()`, `is_coach()`, `can_vote_routine()` → `SECURITY DEFINER`, `GRANT anon,authenticated` para RLS (advisor WARN esperado, no revocar anon o rompe `routine_days` SELECT para shared anon).

**RLS model (verified anon vs authenticated — 2026-08-31):**

| Table | Policy | Access |
|---|---|---|
| users | own profile / admin all / coach view | `auth.uid()=auth_id` / `is_admin()` / `is_coach()` |
| products / exercises / categories / plans | viewable everyone / editable admin | `SELECT true` / `ALL is_admin()` → anon puede `SELECT` (landing/catálogo) pero `INSERT 42501` bloqueado |
| payments | dueño ve suyas / admin todo; INSERT propio o admin; DELETE propio-pending | UPDATE status solo admin → trigger |
| notifications | solo propias | `user_id = auth.uid()` |
| routines | owner/admin/coach OR shared | `is_shared=true` anon ve shared; writable owner/admin/coach |
| routine_votes | viewable everyone / votable | `SELECT true`; INSERT `can_vote_routine` bloquea self-vote |
| routine_days / routine_exercises | inherit via routines + `is_shared` (2026-08-31 fix) | anon ve días/ejercicios de `is_shared=true`; writable owner/admin/coach |
| check_ins | own/admin/coach | anon 0, auth own |
| workout_logs / set_logs | own/admin/coach | writes vía `save_workout` RPC |

> **Golden rule:** frontend guard (`isAdmin` hide) es cosmético. RLS es la protección real. Nueva tabla/columna = policy + regen `database.types.ts`.

---

## State & Data Fetching — TanStack Query v5 + Wizard Context

**Provider:** `src/components/providers/query-provider.tsx:1` — `staleTime: 60_000`, `refetchOnWindowFocus: false`, `retry: 1` / `0`.

**Conventions:**
1. **Query keys factory** per entity (unificado 2026-08-31):
   ```ts
   // src/_features/gym-routines/hooks/useRoutines.ts:13
   export const routineKeys = {
     all: ["routines"] as const,
     byUser: (userId: string) => ["users", userId, "routines"] as const,
     detail: (id: number) => ["routines", id] as const,
   }
   // uso: invalidateQueries({queryKey: routineKeys.byUser(id)}) no strings sueltas
   ```
2. **One hooks file per feature** (`_features/<x>/hooks/use<X>.ts`) exporting `use<X>`, `useCreate<X>`, `useUpdate<X>`, `useDelete<X>`.
3. **Mutations** `createClient()` dentro de `mutationFn`, `throw new Error(error.message)` (no `throw error` crudo → evita `[object Object]` `stitched-error.ts`), `zod` defensivo en `mutationFn` además del form (segunda capa), `invalidate byUser/detail` onSuccess.
4. **Transacción `persistDays` (2026-08-31 fix):** `delete routine_days` con `if(delErr) throw new Error(delErr.message)` + `try {await persistDays} catch(e){ await delete routines header; throw e}` → no deja huérfano si falla día 2. Futuro: `rpc save_routine` como `save_workout`.
5. **Optimistic deletes** — snapshot → remove → rollback (canon `useDeleteUser:122`, `useDeleteProduct`, `useDeleteRoutine:102` en `useRoutines.ts`).
6. Delete hooks reciben **full row** para toast con nombre.

**Wizard — `routine-form` local state (2026-08-31 decision):**

- **NO Zustand** para wizard. Estado (`step`, `metadata`, `days`, `errors`, `isSubmitting`) vive y muere dentro del Dialog — no necesita sobrevivir entre rutas. Zustand es para estado global cross-route (carrito, gamificación, modales globales) y obligaría a `reset()` manual al cerrar (riesgo stale).
- **Patrón:** `useReducer + 2 Contexts` interno scropeado en `src/_features/gym-routines/components/routine-form/context.tsx:1` — split `WizardStateCtx` + `WizardDispatchCtx` para que consumers que solo disparan acciones no re-rendericen cuando cambia state. Oficial `react.dev/learn/scaling-up-with-reducer-and-context`.
- **React 19.2.8:** `createContext` provider directo `<WizardStateCtx value={state}>` (no `<WizardStateCtx.Provider>`). `useContext` consume. Lazy init `useReducer(reducer, undefined, () => ({step:"datos", metadata: initialMetadata(), days: initialDays()}))`.
- **Scope:** `RoutineFormProvider` solo envuelve `RoutineFormShell` → `ShellChrome` → `FormBody`. No global, no admin dialogs. Al desmontar Dialog el estado muere solo.
- **Actions serializables:** `type:"set_step"|"set_metadata_field"|"set_errors"|"set_submitting"|"set_days"` con payload plano `days: DayDraft[]`. NO pasar `updater: (prev)=>...` función dentro de action. `StructureTab:9` y `MetadataTab:38` ahora consumen `useWizardState/useWizardDispatch` directo — cero prop drilling incluso hacia tabs. `useSetDays` wrapper eliminado 2026-08-31.
- **Regla conservadora deps:** `package.json` 23 deps. No añadir lib nueva si React puro resuelve. Documentar excepción en Decision Log.

---

## Validation — Zod (2026-08-31)

**Schemas:** `src/_features/gym-routines/lib/routine.schema.ts` (`routineMetadataSchema`, `routineStructureSchema`, `fullRoutineSchema`, `zodToWizardErrors`) + `src/_features/gym-admin/lib/user.schema.ts`, `product.schema.ts`, `plan.schema.ts`, `payment.schema.ts`. `zod:4.5.4`.

**Regla:** validar **antes** de `TanStack`/`Supabase` con `safeParse` en el **frontend** (`form-body.tsx:57` `goNext/handleSave`, `user-form-dialog:100`, `product:80`, `plan:76`, `walk-in:72`) y defensivo en **hooks** `mutationFn` (`useUsers:65` `userFormSchema.safeParse`, `useProducts:41` etc.) → evita `422` + `Postgres check` crudo, mensaje `zod` UX. `dto` sigue con `trim`/`Number` pero ya validado; `coerce` en `product/plan` evita `Number()` manual. `walk-in` valida `userId uuid` + `planId uuid` (antes solo `!!planId`).

**Wizard mapping:** `zodToWizardErrors` convierte `ZodError` → `Record<string,string>` plano (`errors.name`, `errors.days_per_week`, `errors["day_0_focus"]`, `errors.days`) para que `MetadataTab:48` / `StructureTab:11` rendericen sin conocer Zod.

---

## Feedback System — Sonner Toasts

**Mount:** `<AppToaster />` (`src/components/providers/app-toaster.tsx`) en root layout → `top-right`, Lucide icons. Styles `src/app/globals.css:112` `/* Sonner tactical neon */` — borde lateral + glow `Monster #96D906` success / `#ef4444` error.
**Rules:** Toasts **solo en hooks** `onSuccess/onError`, nunca en componentes (excepto `walk-in` `zod` `toast.error` previo a mutate). `throw new Error(error.message)` para que `description: error.message` no sea `[object Object]`.

---

## Authentication & Route Protection

- **OAuth only** (Google / Facebook). No email+password. `role` leído de **DB `users.role`**, nunca `user_metadata`.
- **`src/proxy.ts`** (Next 16 `proxy` = ex-middleware): `protectedPaths` `/dashboard`, `/users`, `/products`, `/routines`, `/membership`, `/payments`, `/plans`, `/workout` → redirect `/auth/login`; `/auth/login` autenticado → `/`. Usa `createServerClient` con `cookies` y `parseCookieHeader` (`context7` `supabase/ssr` `getClaims` es optimización futura, hoy `getUser` funcional).
- **`AuthProvider` SSR (2026-08-31 fix getUser):** `src/app/layout.tsx` `async` → `createClient()` `lib/supabase/server.ts` → `auth.getUser()` (validado contra Auth server, **no** `getSession` de cookies) → `select users where auth_id` → `<AuthProvider initialUser/initialProfile>` `src/components/providers/auth-provider.tsx` (`createContext`, `loading` inicial `!initialUser`). `useAuthSession()` `auth/hooks` ahora es `useContext(AuthContext)` sync → sin flash `Acceso restringido` en hard reload. `onAuthStateChange` re-valida con `getUser()` antes de confiar en `session.user`. `QueryClient` queda solo para data `public.*`, no para sesión. `proxy.ts` ya usa `getUser()`.
- **FloatingNav ORDEN:** Dashboard → Mi perfil → Entrenar → Mis Rutinas → Ranking → Mi membresía → Productos → (Usuarios si admin/coach) → (Pagos/Planes si admin) → Configuración → Cerrar sesión.
- **Logout:** `supabase.auth.signOut()` → `navigate('/auth/login')`.

---

## Navigation & Page Transitions

`usePageTransition().navigate(href)` (`src/_features/shared/hooks/usePageTransition.ts`) con GSAP curtain `gsap-page-exit` + `TRANSITION_DURATION_MS+20`, no `router.push`. `FloatingNav` y `Breadcrumbs` usan este hook.

---

## Routine Wizard — Flujo detallado

```
RoutineFormDialog (dialog.tsx:21) — gate open + useBodyScrollLock + key={routine?.id ?? "new"} remount
  └─ RoutineFormShell (shell.tsx:11) — define EMPTY_METADATA + createEmptyDays, envuelve RoutineFormProvider (lazy init)
      └─ ShellChrome (chrome.tsx:18) — hidrata days vía hydrateDaysFromRoutine(routine.id)+dispatch set_days, loader z-[100]
          └─ FormBody (form-body.tsx:16) — consume useWizardState/dispatch, zod validate, goNext/goBack/handleSave, sonner
              ├─ MetadataTab (metadata-tab.tsx:38) — consume useWizardState/dispatch directo (solo props: errors/firstFieldRef/onEnter)
              └─ StructureTab (structure-tab.tsx:9) — consume useWizardState/dispatch directo (solo prop: errors), DayEditor[] + addDay/removeDay/moveDay via dispatch set_days
```
- **Validaciones por step:** `step==="datos"` → `routineMetadataSchema`, `step==="estructura"` → `routineStructureSchema` + `days`, `handleSave` → `fullRoutineSchema`. Errores viven en `WizardState.errors` y se mapean vía `zodToWizardErrors`.
- **Hydration edit:** `chrome.tsx:18` `useEffect` `hydrateDaysFromRoutine` solo si `routine`, `cancelled` flag, `dispatch set_days`. Loader bloquea render hasta `hydratedDays`.
- **Persistencia:** `page.tsx` de `users/profile/[id]/routine` llama `onSubmit` → `useCreateRoutine` / `useUpdateRoutine` + `persistDays` transaccional.
- **Cero drilling:** `shell→chrome→form-body→tabs` ya no pasa `step/metadata/days/errors/isSubmitting` por props. Todo via `useWizardState/dispatch`. `own-profile-dialog.tsx:39` también migrado a `key` remount + `OwnProfileInner` lazy (igual que `user-form-dialog.tsx:53`).

---

## Admin Page Pattern

Guard `isAdmin/loading` → glows + header chip+H2 → Stats (3) + Toolbar (search+view toggle+Nuevo) → TanStack data → `FormDialog` (key remount) + `ConfirmDeleteDialog` (`z-[100]`).

### Shared Routines (`/routines`, public)
`useSharedRoutines` `is_shared=true` + votes, ranking client, `Flame` vote, `CopyPlus` → `rpc copy_shared_routine` → `byUser` invalidate.

### Workout (`/workout`)
`workout-session.tsx` `Mi rutina` (detect `is_active`) pills `dayLabel` + `Libre` catalog, `useSaveWorkout` → `rpc save_workout`.

### Dashboards (`/dashboard`)
`Dashboard.tsx` router por rol (`admin-dashboard`, `CoachDashboard`, `MemberDashboard`) → `check-in-card` + `membership-banner` etc. Nunca `Date.now()` en render → `useNow()`.

---

## UI / Design System

**Palette Monster:** `--primary: #96D906` (`globals.css:58`) + `#000000` background + `#09090b` card + `#1a1a1a` border/muted. Tipografía `Geist Sans` + `Geist Mono` para labels técnicos. `font-sans` uppercase tracking-tight para H2.

**Primitives:** `src/components/ui/*` sobre `@base-ui/react` + `shadcn` + `tailwind-merge` + `clsx` + `class-variance-authority`. Actuales: `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `select.tsx`, `table.tsx`, `tabs.tsx`, `badge.tsx`, `avatar.tsx`, `carousel.tsx`, `coverflow-carousel.tsx`, `progress.tsx`, `skeleton.tsx`, `separator.tsx`. Eliminados 2026-08-31: `badge|carousel|coverflow|progress|skeleton|tabs|separator` ya restaurados porque volvieron a usarse (Tabs en Plans, Carousel en Landing) — lista actual es la del `glob` real.

**Landing specifics:** `Hero5`, `DifferencesSection`, `CoachesSection`, `FanDeckCards2`, `Gallery`, `MembershipSection` (con `@property --tb-angle` border spinning `globals.css:205`), `LocationHours`, `FinalCTA`, `Footer`. `ConstellationBackground`, `FloatingNav`.

**Sonner:** `globals.css:112-200` tactical neon — `data-sonner-toast` con barra lateral `::before` y glow por tipo.

---

## Mobile Conventions (2026-08-22)

Base 375px, `sm:` restaura desktop. Dialogs `max-h-[85vh]` `overflow-y-auto`, sticky footer `bottom-0 -mx-4`, header `px-4 sm:px-6`, taps `h-9 w-9 sm:h-7`, Tables→cards `sm:hidden`, grids `grid-cols-1 sm:grid-cols-2`, micro-labels `text-[9px]` para `ExerciseEditor`, `cursor-pointer` siempre, `truncate` emails. `inputCls` con `border-destructive` si error.

## Page Layout — Vertical Rhythm (2026-08-31)

**Regla global para TODAS las `src/app/**/page.tsx` (mobile y desktop):**

```tsx
// shell canónico — 2026-09-01: py-16 unificado mobile+desktop (antes py-20 sm:py-24)
// evita choque con Aside/FloatingNav en mobile y desalineación entre pages
<main className="relative min-h-screen bg-background py-16 text-foreground overflow-x-hidden selection:bg-primary/30">
  <ConstellationBackground /> {/* opcional solo en app pages con fondo oscuro */}
  <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <header className="mb-10"> {/* header 40px, no mb-6 */}
      <span className="mb-4 inline-flex ...">label</span>
      <h1 className="font-sans text-4xl font-black uppercase tracking-tighter md:text-6xl">...</h1>
      <p className="mt-3 font-mono text-sm md:text-base">...</p>
    </header>
    {/* contenido */}
  </div>
</main>
```

- `py-16` (64px) unificado `mobile + desktop` en `main` — evita choque con `Aside` en mobile y desalineación vertical entre pages (antes `py-20 sm:py-24` 80/96px). Nunca `py-20`/`py-8` en page shells.
- `max-w-6xl` para dashboards/admin, `max-w-2xl` solo para flujos focales (`workout`, `auth/login`). `history/success` ya usan `max-w-2xl`/`max-w-lg` correcto.
- `mb-10` para header de página (no `mb-6`), `gap-6`/`gap-8` entre secciones (no `gap-3` en page root).
- `ConstellationBackground` opacity: `app/page.tsx` (landing) `opacity-100` (hero), **todas las `app/**/page.tsx` de features `opacity-40`** (`<div className="opacity-40"><ConstellationBackground/></div>`) para no competir con cards/tablas. Migrado 2026-09-01: `dashboard, membership, payments, plans, products, routines, users, workout/*` de `py-20 sm:py-24` → `py-16`.
- Navegación sin `Volver`: desde `2026-09-01` las pages `profile`, `user-routines`, `workout-session` no llevan botón `Volver` — se navega por `Aside`/`FloatingNav`.
- Pre-delivery: verificar `py-16` + `opacity-40` en toda nueva app page.

---

## Development Environment

- `http://localhost:3000` siempre (no `127.0.0.1`).
- `npx tsc --noEmit` verificación. `eslint-config-next:16.3.0`.
- **MCP `opencode.json` (2026-08-31):** `mcp.supabase` (`@supabase/mcp-server-supabase --project-ref wknacbyqqpsvswjhwrbx` + `SUPABASE_ACCESS_TOKEN` `sbp_...`), `mcp.context7` (`@upstash/context7-mcp` + `CONTEXT7_API_KEY` `ctx7sk-...`), `mcp.github` (`@modelcontextprotocol/server-github` + `GITHUB_TOKEN`). Env `User` persistente, `opencode` reinicia para cargar.
- Supabase MCP para SQL/advisors, `get_advisors` security/performance.
- Eliminados 2026-08-31: `bash.exe.stackdump`, `tsc-check.log`, `tsconfig.tsbuildinfo`, `scripts/_fexdb.json` (1MB dataset ya importado), `.zcode/plans`, `supabase/.temp`. `database.types.ts` es generado — no commitear manual si no hay migración.

---

## Global Rules

**Anti-Patterns (2026-08-31 actualizado):**
- ❌ `setState` síncrono en `useEffect` para sync `form` de `props` → usar `key` remount + `useState(()=>props)` lazy (fix `product-form:48`, `plan:48`, `walk-in:46`, `routine-form/chrome:97` ya migrado; `RoutineFormShell` ya no hace setState en effect).
- ❌ `throw error` crudo de Supabase (PostgrestError object) → `throw new Error(error.message)` o `[object Object]` en devtools.
- ❌ `persistDays` sin `throw delErr` ni rollback → huérfano.
- ❌ Query keys strings sueltas `["users",id,"routines"]` → usar factory `routineKeys.byUser`.
- ❌ Pasar función no-serializable dentro de `WizardAction` (`updater: (prev)=>...`) → usar `set_days` con payload plano `days: DayDraft[]`. Wrapper `useSetDays` eliminado.
- ❌ Estado local de wizard en Zustand/global store → usar `RoutineFormProvider` scropeado que muere al cerrar Dialog.
- ❌ `Context.Provider` en React 19.2 → usar `<Ctx value={...}>` directo.
- ❌ Validar solo en hook o solo en componente → validar en ambos (frontend `safeParse` + defensivo en `mutationFn`).

**Pre-Delivery Checklist (2026-08-31 actualizado):**
- [ ] `zod` schema en `lib/*.schema.ts` + validación en `component` y defensiva en `hook`
- [ ] Dialogs usan `key` remount, no `setState` en effect sync
- [ ] `throw new Error(error.message)` en todos los hooks
- [ ] `queryKeys` factory unificado + `invalidate byUser/detail`
- [ ] `AuthProvider` SSR sin flash, `proxy` mismas cookies
- [ ] Wizard usa `RoutineFormProvider` (2 contexts) + `useReducer` + `<Ctx value>` React 19, no prop drilling 17 props
- [ ] `npx tsc --noEmit` + `eslint` 0 en `routine-form/*` y `gym-admin/lib/*`
- [ ] `MASTER.md` actualizado si se añade tabla/columna/policy/feature

---

## Decision Log

| Fecha | Decisión | Razón | Alternativa descartada |
|---|---|---|---|
| 2026-08-31 | `RoutineForm` wizard → `useReducer + 2 Contexts` scropeado en `routine-form/context.tsx` | Estado local que muere con Dialog, 5 acciones agrupadas en dispatch, evita prop drilling `shell→chrome→form-body` sin deps nuevas. Split State/Dispatch evita re-renders. React 19 `<Ctx value>` | Zustand: brilla para global cross-route, pero aquí obliga `reset()` manual y añade dep a `package.json:23` sin necesidad. Se reconsidera si borrador debe sobrevivir fuera del wizard. |
| 2026-08-31 | `own-profile-dialog` → `key` remount + `useState` lazy (igual que `user/product/plan/walk-in`) | Consistencia, no necesita context ni zod extra | Context para own-profile — innecesario |
| 2026-08-31 | `persistDays` transaccional con rollback header | Evita rutina huérfana si falla día 2 | RPC `save_routine` futuro |
| 2026-08-31 | Granularidad 1 concern/file para `routine-form` y `user-routines` | Legibilidad, evita monolitos 500+ líneas | Monolitos `routine-form-dialog.tsx` / `user-routines.tsx` |
