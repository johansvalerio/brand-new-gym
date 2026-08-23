## Fix: scroll horizontal por ConstellationBackground (navbar desplazado)

### Causa raíz (confirmada en código)
1. `ConstellationBackground.tsx` dimensiona el canvas con `window.innerWidth` — que INCLUYE el scrollbar vertical (~17px desktop) → documento más ancho que el contenido.
2. Los `<main>` de las páginas no tienen `relative` → el canvas (`absolute inset-0`) se ancla al body, escapando del `overflow-x-hidden` de cada página → nada lo recorta → scroll horizontal a nivel documento → el navbar fijo se percibe desplazado a la derecha.

### Cambios

**1. `src/_features/shared/components/ConstellationBackground.tsx`**
- En `resize()`: usar `document.documentElement.clientWidth / clientHeight` (viewport SIN scrollbar) para el estilo y el bitmap del canvas, en lugar de `window.innerWidth/innerHeight`.
- En inicialización de partículas (L117) y en `draw()` (L131): usar esas mismas dimensiones medidas (cacheadas en el resize) para los límites de rebote.

**2. Anclar el canvas dentro de cada página — agregar `relative` a los `<main>`:**
- `src/app/users/page.tsx`: agregar `relative`
- `src/app/products/page.tsx`: agregar `relative`
- `src/app/routines/page.tsx`: agregar `relative` Y `overflow-x-hidden` (es la única de las tres que no lo tiene)
- `src/app/users/profile/[id]/routine/page.tsx`: agregar `relative`

**3. Revisar los otros 2 usos del componente:**
- `src/_features/auth/components/Login.tsx` — verificar si su contenedor es `relative`; si no, agregarlo.
- `src/_features/gym-landing/components/StoryText2.tsx` — según spec tiene contenedor propio `h-screen relative`; solo confirmar.

### Por qué esto resuelve ambos síntomas
- Desktop: el canvas ya no mide 17px de más → desaparece el scroll horizontal.
- Mobile/web: el canvas queda dentro del contexto de clipping de cada página (`relative` + `overflow-x-hidden`) → ningún elemento puede ensanchar el documento → el navbar fijo deja de "moverse".

### Verificación
- `npx tsc --noEmit` + detector impeccable limpio.
- Tu navegador: en /users, /products, /routines, /users/profile/[id]/routine y login — ya no debe existir pan lateral ni en mobile ni en web; las partículas siguen cubriendo toda la altura de la página (el canvas estira con el alto real del main).
- Landing (StoryText2) sin cambios visuales.