## Plan: dialogs por encima del FloatingNav (sin pt-24)

### Problema
El `FloatingNav` está en `z-90` y los dialogs en `z-50`. Cuando abres un dialog, el navbar se ve encima del backdrop oscuro y el panel queda descentrado.

### Solución
Subir el z de los dialogs a `z-[100]` (consistente con el lightbox de Gallery que ya lo usa). Al quedar por encima del navbar, el panel puede centrarse naturalmente con `flex items-center justify-center`, sin necesidad del `pt-24` actual.

### Cambios

**5 archivos** (todos usan `fixed inset-0 ... flex items-center justify-center p-4`):

1. `src/_features/gym-admin/users/components/user-form-dialog.tsx`
   - `z-50` → `z-[100]`
   - Quitar `pt-24`

2. `src/_features/gym-admin/users/components/confirm-delete-dialog.tsx`
   - `z-50` → `z-[100]`
   - Quitar `pt-24`

3. `src/_features/gym-admin/products/components/product-form-dialog.tsx`
   - `z-50` → `z-[100]`
   - Quitar `pt-24`

4. `src/_features/gym-admin/products/components/confirm-delete-dialog.tsx`
   - `z-50` → `z-[100]`
   - Quitar `pt-24`

5. `src/_features/gym-routines/components/routine-form-dialog.tsx`
   - `z-50` → `z-[100]`
   - Quitar `pt-24`

6. `src/_features/gym-routines/components/confirm-delete-routine-dialog.tsx`
   - `z-50` → `z-[100]` (no tiene `pt-24`, no tocar)

### Documentación

- **`design-system/gym-landing-page/MASTER.md`**: actualizar la nota sobre dialogs.
- **Memoria `dialog-nav-clearance-convention.md`**: actualizar al nuevo patrón.

### Verificación
- `npx tsc --noEmit`
- Visual: panel del dialog centrado en pantalla completa.

### Fuera de alcance
- DialogProvider global para apagar el navbar durante el dialog (PR aparte, más invasivo).
- Cambiar `z-90` del FloatingNav.