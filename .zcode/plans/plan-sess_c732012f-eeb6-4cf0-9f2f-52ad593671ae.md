Roles en nav y lista de usuarios — SOLO estos 2 cambios (alcance cerrado):

## 1. `FloatingNav.tsx` — item "Usuarios" para admin Y coach
- `UserProfile` gana `isCoach`; se deriva del `role` que ya expone `useAuthSession` (`role === "coach"`).
- El item "Usuarios" pasa de `user.isAdmin && (...)` a `(user.isAdmin || user.isCoach) && (...)`.
- Nada más se toca ahí: "Productos" queda visible para todos los logueados (tu decisión), "Rutinas" ya navega (sin cambios).

## 2. `Users.tsx` + `users-card.tsx` + `users-table.tsx` — vista por rol
- Guard: `canViewUsers = isAdmin || role === 'coach'` (el coach puede entrar y ver stats/búsqueda/tarjetas/tabla); `canManageUsers = isAdmin` (CRUD intacto); nuevo `canAssignRoutine = role === 'coach'`.
- `Users.tsx` pasa a cards/table: `canManage` (como hoy), `canAssignRoutine` y `onViewRoutine={(u) => navigate(\`/users/profile/${u.id}/routine\`)}`.
- **Admin** (`canManage`): Eye + Pencil + Trash — exactamente como hoy, sin cambios.
- **Coach** (sin canManage, con canAssignRoutine): **un único botón Dumbbell** con aria "Crear rutina del miembro" → navega a la página de rutinas del miembro (donde aplica la regla de coach asignado que definiste).

## 3. Documentación (MASTER.md)
Modelo de roles: nav (Usuarios: admin+coach; Productos: logueados), botones por rol en la lista (ad-or-coach), regla coach-asignado para rutinas.

## Fuera de alcance (explícitamente diferido)
- Stats/cards admin-only en products (tarea futura separada).
- Todo lo demás.

## Verificación
- `npx tsc --noEmit`.
- Navegador: como admin los 3 botones; como coach (incógnito, recarga dura) acceso a la lista con el botón Dumbbell y el wizard de rutinas; nav muestra/oculta "Usuarios" según rol.