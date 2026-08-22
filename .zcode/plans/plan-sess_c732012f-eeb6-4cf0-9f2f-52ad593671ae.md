Página de perfil `/users/profile/[id]` — accesible para el dueño del perfil (cualquier rol con sesión) y para admins (cualquier perfil), con CRUD solo para admin.

## Reglas de acceso (núcleo del cambio pedido)
- Sin sesión → `proxy.ts` ya redirige a login (`/users/*` está en protectedPaths con startsWith ✓).
- Con sesión, viendo **su propio** perfil (`profile.auth_id === session.user.id`) → ✅ siempre permitido (RLS "Users can view own profile" ya lo respalda).
- `isAdmin` viendo **cualquier** perfil → ✅ + botones CRUD visibles.
- Con sesión pero **sin admin** viendo perfil ajeno → tarjeta "Acceso restringido" (UI más estricta que RLS, que permite lectura a coaches — intencional).

## Archivos nuevos

**1. `src/app/users/profile/[id]/page.tsx`** — Server Component delgada, forma Next 16:
`{ params }: PageProps<"/users/profile/[id]">` → `const { id } = await params` → `<UserProfile id={id} />`.

**2. `src/_features/gym-admin/profile/components/user-profile.tsx`** (`"use client"`):
- **Datos**: hook `useUser(id)` en `useUsers.ts` con `userKeys.detail(id)` (la key por fin se usa) — fetch `.eq("id", id).maybeSingle()`.
- **Guard combinado** (sesión + perfil cargados): `allowed = isAdmin || profile?.auth_id === session?.user?.id`.
- **Estados**: skeleton con espacio reservado (sin CLS), "Miembro no encontrado" con volver, "Acceso restringido" para no-admin ajeno, y perfil.
- **CRUD solo admin** (reutilizando los dialogs existentes, sin duplicar nada):
  - Botón "Editar" → abre `UserFormDialog` (mismo componente de /users) con el row cargado.
  - Botón "Eliminar" → abre `ConfirmDeleteDialog`; al confirmar usa `useDeleteUser` (toast + optimista ya incluidos) y navega de vuelta.
  - Tras editar, la invalidación existente (`keys.all`) refresca el detalle automáticamente.
- **Botón "Volver"**: admin → `/users`; no-admin → `/` (evita mandarlo a una página que le muestra "Acceso restringido").

**Diseño del perfil** (modo Operate, estética táctica MASTER):
- Glows ambientales + hairline superior; chip "PERFIL DE MIEMBRO" + H1 nombre (keyword `text-primary`) + email mono.
- Hero card: avatar grande (grayscale→color hover), badge de rol (ADMIN/COACH/USUARIO con color), badges estado/plan reutilizando `utils.ts`, ID interno, provider.
- Grid Contacto · Membresía · Actividad (join_date, last_visit, verificaciones) — stack mobile / 3 cols desktop.
- Acciones (solo isAdmin): Editar + Eliminar; no-admin solo ve su info.
- Entrada GSAP `y:60, stagger:0.18, power3.out` con scrollTrigger, respeta `prefers-reduced-motion`.

**3. Punto de entrada para todos — "Mi perfil" en el avatar menu** (`FloatingNav.tsx`):
- `useAuthSession` se extiende para traer el row propio completo (hoy solo consulta `role`; pasa a `select("*")` y expone `profile`) — misma query, cero costo extra.
- Item de menú "Mi perfil" (icono User) para cualquier usuario logueado → `navigate(\`/users/profile/${profile.id}\`)`, visible cuando el perfil cargó.

**4. Entrada admin — botón Eye** en `users-card.tsx` (junto a Editar/Eliminar, gated por `canManage`) y acción equivalente en `users-table.tsx` → navega al perfil con `usePageTransition`.

**5. `MASTER.md`**: nota en "Admin Page Pattern" sobre la página de perfil, `useUser` + key detail, y la regla de acceso (dueño siempre, admin todo, CRUD solo admin).

## Verificación
- `npx tsc --noEmit` limpio.
- Navegador localhost:3000: (1) admin entra desde /users con el ojo → perfil de Johans con botones CRUD → editar funciona → volver; (2) "Mi perfil" desde el menú del avatar navega al propio; (3) mobile 375px sin scroll horizontal.

## Fuera de alcance
- Refactor de layouts server (plan anterior, queda pendiente).
- Edición de campos que el form no cubre hoy (membership_start/end, address).