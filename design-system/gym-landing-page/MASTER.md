# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Gym Landing Page
**Updated:** 2026-08-07
**Category:** Fitness/Gym App

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