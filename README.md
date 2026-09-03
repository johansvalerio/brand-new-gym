# Gymulate — frontend Next.js 16 + Supabase

## Setup

```bash
cp .env.example .env.local   # rellenar claves de Supabase
npm ci
npm run dev                  # http://localhost:3000
```

## Verificación

```bash
npm run lint        # eslint, 0 errores
npm run typecheck   # tsc --noEmit
npm run test        # vitest run (helpers puros: PRs, rutinas, nutrición)
npm run build       # next build
```

CI (`.github/workflows/ci.yml`) corre lint + typecheck + test + build en push/PR a `main`.

## Supabase

- Proyecto linkeado: `wknacbyqqpsvswjhwrbx` (`npx supabase status` requiere Docker local).
- Migraciones en `supabase/migrations/`. Los SQL de imágenes (`scripts/update-*-images.sql`) son generados por `scripts/import-*.mjs` / `scripts/download-food-images.mjs` y se aplican aparte (ver punto 5 del plan) — no van en migraciones para no binarizar jpgs.
- Fotos locales: `public/foods/` (34) y `public/exercises/` sirven vía `<img>` con `image_url` en DB (`/foods/<slug>.jpg`).

## Scripts de imágenes

```bash
node scripts/download-food-images.mjs  # Wikimedia Commons → public/foods/
node scripts/import-food-images.mjs    # regenera scripts/update-food-images.sql
```
