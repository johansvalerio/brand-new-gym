## Plan: Fix móvil de /routines + precios de MembershipSection

### Diagnóstico

**MembershipSection** (`src/_features/gym-landing/components/MembershipSection.tsx`)
- La fila del precio (línea 277) usa `flex items-end gap-2` sin `flex-wrap`, con el monto fijo en `text-6xl` también en móvil. En un phone de 375px, `₡10.000` a 60px + `/mes` no caben en los ~277px útiles → el sufijo se sale del card y el `overflow-hidden` del Card lo recorta (por eso "/mes"/"/semana" no se ven).
- Latente: `CARD_VISUALS` solo tiene llaves para `duration_days` 1/7/30. Si el plan ANUAL es 365 días, cae en `fallbackVisual` → muestra "/365 días" sin descripción ni beneficios.

**/routines** (`src/_features/gym-routines/components/shared-routines.tsx`)
- El `<header>` de cada card (línea 206) es un flex SIN wrap: badge de ranking (40px) + bloque de autor (avatar 40px + pills de procedencia) + botón de voto, con `gap-4` y paddings fijos. El mínimo ancho suma ~360px > los 343px disponibles a 375px → la fila no puede encoger, el artículo se estira más allá del viewport y `overflow-x-hidden` del main lo corta: las cards "se salen".
- El aside de stats usa `grid grid-cols-2` duro (línea 350), contrario a la convención MASTER (`grid-cols-1 sm:grid-cols-N`).

### Cambios

**1. MembershipSection.tsx**
- Fila de precio: `flex flex-wrap items-end gap-2` y monto `text-5xl sm:text-6xl` (desktop idéntico a hoy; en 375px cabe; bajo 340px el sufijo baja de línea en vez de cortarse).
- Verificar en la tabla `plans` los valores reales de `duration_days` (SELECT vía Supabase MCP) y alinear las llaves de `CARD_VISUALS` si difieren de 7/30.
- Agregar entrada `365` a `CARD_VISUALS`: icono `Trophy` (importado de lucide), period `"/año"`, descripción + 4 beneficios en el mismo tono que las demás cards, `highlighted: false`.

**2. shared-routines.tsx** (patrón mobile-first de MASTER: compactar base, restaurar desktop con `sm:`)
- Header de card: `gap-4` → `gap-3 sm:gap-4`.
- Badge de ranking: `h-10 w-10` → `h-9 w-9 sm:h-10 sm:w-10`.
- Avatar de autor (prop `className` de `AuthorAvatar`): `h-9 w-9 sm:h-10 sm:w-10` en la card (el aside mantiene `h-9 w-9`).
- Botón de voto: `px-3 py-2 sm:px-3.5 sm:py-2` y llama `h-4 w-4 sm:h-5 sm:w-5` (sigue ≥40px de alto para tap).
- Lista de cards (línea 137): agregar `min-w-0` como seguro contra el estirado del grid.
- Aside stats (línea 350): `grid-cols-1 sm:grid-cols-2` (en lg+ se ve igual que hoy).

### Verificación
- Dev server en localhost:3000 y revisión visual con browser-use a 375px: cards de /routines completas dentro del viewport, sufijos "/semana"/"/mes"/"/año" visibles en las 3 pricing cards, y desktop (1280px+) intacto en ambas páginas.