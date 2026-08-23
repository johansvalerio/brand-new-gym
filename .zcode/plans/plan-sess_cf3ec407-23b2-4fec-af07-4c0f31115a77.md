## Plan: Mobile-first pass en gym-admin + gym-routines (desktop intacto)

Estrategia global: estilos base = mobile (375px), y cada tamaño actual de desktop se restaura con `sm:`/`md:` para que la web quede EXACTAMENTE igual. Principios de `mobile-app-ui-design`: grid de 8pt, tap targets ≥40px en mobile, jerarquía simple. Se activarán `ui-ux-pro-max` + `impeccable` durante la ejecución (detector antes/después) y Context7 si hace falta verificar utilidades de Tailwind v4.

### Fase 1 — CRÍTICOS (lo roto)

1. **`routine-form-dialog.tsx` — ExerciseEditor** (el peor): base apilado — select de ejercicio a ancho completo, debajo fila `grid-cols-3` con Sets/Reps/Descanso, botón eliminar posicionado sin colapsar; `sm:` restaura el `grid-cols-12` actual exacto.
2. **`user-form-dialog.tsx` + `product-form-dialog.tsx`** — paneles sin scroll: adoptar el patrón que routine-form-dialog ya usa bien → panel `flex max-h-[85vh] flex-col overflow-hidden`, cuerpo del form `overflow-y-auto`, footer pegado abajo. El submit vuelve a ser alcanzable en phones.
3. **DayEditor header** (routine dialog): `flex-wrap`, focus input `w-full sm:w-48 min-w-0`.
4. **Tab bar** (routine dialog): `px-3` + `text-[11px]` en base para que ambas tabs quepan en ~293px.
5. **Stats grids**: `Products.tsx` (admin) y `Users.tsx` → `grid-cols-1 sm:grid-cols-3`.

### Fase 2 — CRAMPED

6. Paddings de los 6 dialogs: header/footer `px-4 py-3 sm:px-6 sm:py-4`, cuerpo `px-4 py-4 sm:px-6 sm:py-5`.
7. `MetadataTab` objetivo/días: `grid-cols-1 sm:grid-cols-2`.
8. Form usuario: nombres `grid-cols-1 sm:grid-cols-2`; selects `grid-cols-1 sm:grid-cols-3`. Form producto: precio/stock `grid-cols-1 sm:grid-cols-2`.
9. Toolbar productos: fila de filtros con `flex-wrap`, select de categoría full-width en base.
10. `RoutineCard` `p-4 sm:p-6`; hero card del perfil `p-4 sm:p-8`; footer del routine dialog con `flex-wrap`.

### Fase 3 — MINOR sistémicos

11. **Tap targets** (más grandes SOLO en mobile, desktop igual): botones de acción en tablas `h-10 w-10 sm:h-8 sm:w-8`; en cards `h-10 w-10 sm:h-9 sm:w-9`; day editor y close buttons `h-9 w-9 sm:h-7/sm:h-8`; ToggleBtn con área táctil mayor en base.
12. `aria-label` en "Nuevo" icon-only (Users + Products) y ToggleBtns.
13. Email en users-card con `truncate`; nombre de rutina en shared-routines `line-clamp-2 sm:truncate`.
14. Confirm-deletes (3): guard `max-h-[85vh] overflow-y-auto`.
15. Página `/rutinas`: `py-16 sm:py-24`.

### Fase 4 — Tablas → tarjetas en mobile (tu decisión)

16. **`Users.tsx` + `Products.tsx`**: bajo `sm:` SIEMPRE se muestran las cards; la tabla solo existe ≥sm. CSS-only sin doble lógica:
    - Cards: `<div className={view === "table" ? "sm:hidden" : ""}>`
    - Tabla: `view === "table"` envuelta en `<div className="hidden sm:block">`
17. El toggle Tarjetas/Tabla se oculta bajo `sm:` (`hidden sm:flex`) porque en mobile la decisión no aplica.

### Fase 5 — Verificación y documentación

- `npx tsc --noEmit` limpio.
- Detector de `impeccable` (--json) antes y después.
- MASTER.md: nueva sección "Mobile conventions" (patrón dialog con max-h+scroll interno, regla de tap targets con restauración sm:, tablas→cards bajo sm, paddings base).
- Memoria actualizada.
- Verificación visual final en tu navegador (OAuth bloquea testing del agent en rutas admin); `/rutinas` sí es pública.

**Archivos tocados (~15):** routine-form-dialog, user-routines, shared-routines, confirm-delete-routine-dialog, Users, users-card, users-table, user-form-dialog, confirm-delete (users), Products, products-card, products-table, product-form-dialog, confirm-delete (products), user-profile, app/rutinas/page. Desktop queda pixel-idéntico al usar breakpoints de restauración.