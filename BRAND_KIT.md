# DigitalGuard — Brand Kit

> Digital wellness / family digital parenting platform. Clean, calm, warm-tech aesthetic with a tri-color teal→rose→lavender accent gradient.

---

## 1. Identity

| | |
|---|---|
| **Product name** | DigitalGuard |
| **Tagline** | Digital Wellness Reimagined |
| **One-liner** | Take control of your digital life — screen time, digital wellness, online safety. |
| **Logo asset** | `/dg-logo.png` (PNG, used as favicon + OG + Twitter image + nav mark) |
| **Wordmark** | `DigitalGuard` — set in `font-black tracking-tight uppercase` in the nav |

---

## 2. Color System

All CSS custom properties are defined in `src/index.css` under `@layer base :root` / `.dark`. Tailwind reads them via `hsl(var(--name))`.

### Light mode

| Token | HSL | Approx. hex | Role |
|---|---|---|---|
| `--background` | `0 0% 100%` | `#FFFFFF` | Page background |
| `--foreground` | `222.2 47.4% 11.2%` | `#0F172A`-ish | Primary text |
| `--muted` | `210 40% 96.1%` | `#F1F5F9` | Subdued surfaces |
| `--muted-foreground` | `215.4 16.3% 35%` | `#5B6470` | Secondary text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card background |
| `--card-foreground` | `222.2 47.4% 11.2%` | (same as fg) | Card text |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popover bg |
| `--border` | `217.2 32.6% 70%` | `#Cbd5e0`-ish | Default borders |
| `--input` | `217.2 32.6% 70%` | (same) | Input borders |
| `--ring` | `222.2 47.4% 11.2%` | (same as fg) | Focus ring |
| `--primary` | `222.2 47.4% 11.2%` | (dark) | Primary actions/text |
| `--primary-foreground` | `210 40% 98%` | `#F8FAFC` | Text on primary |
| `--secondary` | `210 40% 96.1%` | `#F1F5F9` | Secondary surfaces |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | (dark) | Text on secondary |
| `--accent` | `210 40% 96.1%` | `#F1F5F9` | Accent surfaces |
| `--accent-foreground` | `222.2 47.4% 11.2%` | (dark) | Text on accent |
| `--destructive` | `0 100% 50%` | `#EF4444` | Destructive / error |
| `--destructive-foreground` | `210 40% 98%` | `#F8FAFC` | Text on destructive |

### Dark mode

| Token | HSL | Approx. hex | Role |
|---|---|---|---|
| `--background` | `222.2 84% 4.9%` | `#0F172A` | Page background |
| `--foreground` | `210 40% 98%` | `#F8FAFC` | Primary text |
| `--muted` | `217.2 32.6% 17.5%` | `#1E293B` | Subdued surfaces |
| `--muted-foreground` | `215 20.2% 75%` | `#A1A5B0` | Secondary text |
| `--card` | `222.2 84% 4.9%` | `#0F172A` | Card background |
| `--card-foreground` | `210 40% 98%` | `#F8FAFC` | Card text |
| `--primary` | `210 40% 98%` | `#F8FAFC` | Primary actions/text |
| `--primary-foreground` | `222.2 47.4% 11.2%` | `#0F172A` | Text on primary |
| `--secondary` | `217.2 32.6% 17.5%` | `#1E293B` | Secondary surfaces |
| `--border` | `217.2 32.6% 25%` | `#334155`-ish | Borders (lighter than light-mode for definition) |
| `--ring` | `212.7 26.8% 83.9%` | `#CBD5E1`-ish | Focus ring |
| `--destructive` | `0 62.8% 30.6%` | `#B91C1C` | Destructive / error |

### Brand accent triad (gradient core)

Used in `.gradient-text`, ambient blobs, hover states, buttons, and workshop completion visuals:

| Swatch | Hex | Role |
|---|---|---|
| **Teal** | `#4FD1C5` | Primary accent — buttons, progress, focus rings, links, badge tints (`bg-[#4FD1C5]/10` for chips) |
| **Coral / Peach** | `#FF9A8B` | Warm secondary — gradient midpoint, ambient blob, rose-family hover |
| **Lavender** | `#B794F4` | Cool tertiary — gradient end, ambient blob |
| **Deep teal** | `#2C7A7B` | Darker teal for text on teal-tinted chips (`text-[#2C7A7B]`) |

**`.gradient-text`** (branded headline gradient):
```css
background: linear-gradient(135deg, #4FD1C5 0%, #FF9A8B 50%, #B794F4 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Ambient background gradients

**Light mode ambient** (`UnifiedBackground` base layer):
`from-[#FFF5F5] via-[#F0FFF4] to-[#E6FFFA]` — warm pink → mint → pale teal.

**Dark mode ambient**:
`from-[#0f172a] via-[#1e293b] to-[#0f172a]` — slate navy.

### Ambient animated blobs (lazy-parallax on fine-pointer devices)

| Blob | Color | Opacity | Blur |
|---|---|---|---|
| Coral/Peach | `#FF9A8B` | 30% light / 15% dark | 60px |
| Mint/Teal | `#4FD1C5` | 25% light / 10% dark | 50px |
| Lavender | `#B794F4` | 25% light / 15% dark | 60px |

---

## 3. Typography

No custom web font is loaded — the app uses the **browser/system font stack** (Tailwind default sans). The visual punch comes from weight and tracking rather than a custom typeface.

### Type roles

| Element | Classes | Weight / style |
|---|---|---|
| **Wordmark / logo text** | `text-2xl font-black tracking-tight uppercase` | 900, tight tracking, all-caps |
| **H1 / hero headlines** | `text-3xl md:text-6xl font-bold` (or `font-black` for impact) | 700–900 |
| **H2** | `text-2xl md:text-4xl font-bold` | 700 |
| **H3** | `text-xl font-bold` | 700 |
| **Section labels / eyebrows** | `text-xs font-black uppercase tracking-widest` | 900, uppercase, wide tracking |
| **Body** | `text-sm font-medium` or default | 400–500 |
| **Button labels** | `font-bold` or `font-medium` | 600–700 |
| **Gradient text** | `.gradient-text` utility | any — clipped to tri-gradient |

**Recommendation / gap:** The project currently has no custom typeface. If a brand font is wanted, a single humanist sans (e.g. *Inter*, *Manrope*, or *Plus Jakarta Sans*) loaded in `index.html` and set in `tailwind.config.ts` under `theme.extend.fontFamily.sans` would sharpen the identity without changing any component code.

---

## 4. Spatial System & Shapes

| Token | Value | Usage |
|---|---|---|
| `--radius` | `0.5rem` (8px) | Base radius, default for cards/inputs |
| `rounded-xl` | 12px | Common card/container |
| `rounded-2xl` | 16px | Larger cards, feature blocks |
| `rounded-3xl` | 24px | Hero cards, workshop completion |
| `rounded-[2rem]` | 32px | Signature/commitment cards |
| `rounded-[2.5rem]` | 40px | Avatars / circular badge frames |
| `rounded-full` | full | Chips, pills, avatar initials |

**Chips / pills pattern:** `rounded-full` pill with `bg-[#4FD1C5]/10 text-[#2C7A7B]` for teal-tinted info badges; `bg-white/60 dark:bg-black/20 border-border hover:border-primary/30` for rule cards.

---

## 5. Motion & Atmosphere

### Background (layer stack, applied in `Layout.tsx`)

1. **`UnifiedBackground`** — fixed, `-z-20`, `pointer-events-none`:
   - Base ambient gradient (light or dark)
   - 3 animated blobs (coral, mint, lavender) with `animate-drift-1/2/3` (18–22s loops) + mouse parallax on fine-pointer devices only
   - SVG noise overlay at `opacity-[0.03]` (light) / `0.05` (dark)
2. **`MoodColorShift`** — subtle mood-based radial-gradient overlay
3. **`OrganicTexture`** — additional texture layer
4. **`WellnessParticles`** — particle ambiance
5. **`GentleTrail`** — cursor trail (auto-disabled on mobile)
6. **`WellnessCompanion`** — AI companion bubble (bottom-right)

### Key animations (in `src/index.css`)

| Animation | Duration | Usage |
|---|---|---|
| `animate-blob-1/2/3/4` | 15–25s ease-in-out infinite | Legacy blobs (superseded by drift) |
| `animate-drift-1/2/3` | 18–22s ease-in-out infinite | UnifiedBackground blobs |
| `animate-breathe` | **12s** ease-in-out infinite | Breathing/relaxation UI rhythm (scale 1 → 1.05, opacity 1 → 0.8) |
| `accordion-down / accordion-up` | 0.2s ease-out | Accordion expand/collapse |

### Motion philosophy

- **Calm, slow, ambient.** Blob drifts and breathing loops are slow (12–25s) and subtle — background atmosphere, not attention-grabbing.
- **Breathing at 12s** — anchors the wellness/relaxation pacing.
- **`prefers-reduced-motion`** is respected: all animations + transitions are collapsed to `0.01ms` with `animation-iteration-count: 1`.
- **Interaction feedback** is snappy: `transition-all duration-300` on buttons, `scale-105`/`scale-[1.02]` hover, `active:scale-[0.98]`.

---

## 6. Component Patterns

### Buttons

- **Primary CTA:** `bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-600 text-white font-black shadow-xl shadow-green-500/20 rounded-xl` — green gradient, black weight, oversized shadow.
- **Secondary / ghost:** `bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium` with `hover:border-[#4FD1C5]` — teal accent on hover.
- **Teal pill:** `bg-[#4FD1C5] text-white font-bold shadow-lg` — used for in-flow actions (e.g. course "Start" buttons).

### Cards

- **Default:** `bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl`
- **Glass / translucent:** `bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-[2rem]` — commitments, feature blocks
- **Tinted gradient card:** `bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-[#4FD1C5]/20 rounded-2xl` — featured/hero content

### Navigation

- Fixed top nav: `bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-border transition-all duration-300`
- Logo: `dg-logo.png` (h-8 w-8 rounded-md) + `DigitalGuard` wordmark `text-2xl font-black tracking-tight uppercase`
- Mobile: hamburger menu with `Menu`/`X` icons

### Footer

- Fixed, see-through: `Footer.tsx` — glass-style bottom bar.

---

## 7. Imagery & Iconography

- **Icons:** `lucide-react` — consistent 1.5px stroke, used throughout (ArrowLeft, Sun/Moon, Check, Upload, AlertTriangle, Loader2, Download, ChevronRight, GraduationCap, etc.)
- **Logo mark:** `dg-logo.png` — placed in nav, OG, Twitter card, favicon. (File exists in `/public`.)
- **Blog/hero imagery:** Inline Tailwind gradient backgrounds via `bg-gradient-to-br from-X-to-Y` (defined per-resource in `public/blog-resources.json`) — blue, green, purple, yellow, red, cyan, slate variants.

---

## 8. Do's and Don'ts

### Do
- Use the **teal (#4FD1C5)** as the primary interactive accent — buttons, links, focus, progress, chip tints.
- Use the **tri-gradient (#4FD1C5 → #FF9A8B → #B794F4)** sparingly, for branded headlines (`.gradient-text`) and featured card tints.
- Keep background ambient — slow blobs, breathing at 12s, noise overlay — and let content sit on calm surfaces.
- Respect `prefers-reduced-motion`.
- Pair dark text on light surfaces; off-white (#F8FAFC) on dark surfaces — always check contrast.

### Don't
- Don't use the tri-gradient as a full-bleed background in content areas — it's for accents and headlines only.
- Don't override `--radius` ad-hoc — use the named Tailwind radius scale (`rounded-xl/2xl/3xl/[2rem]`).
- Don't introduce a fourth accent color without checking it against the triadic teal/coral/lavender palette.
- Don't drop the noise overlay or ambient blobs in a "minimal" variant — they are the brand atmosphere.

---

## 9. Quick Reference (copy-paste tokens)

```css
/* Brand gradient (headlines) */
.gradient-text {
  background: linear-gradient(135deg, #4FD1C5 0%, #FF9A8B 50%, #B794F4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Core accent */
--accent-teal: #4FD1C5;
--accent-teal-deep: #2C7A7B;
--accent-coral: #FF9A8B;
--accent-lavender: #B794F4;

/* Light ambient bg */
background: linear-gradient(to bottom right, #FFF5F5, #F0FFF4, #E6FFFA);

/* Dark ambient bg */
background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);

/* Primary button */
bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
text-white font-black shadow-xl shadow-green-500/20 rounded-xl transition-all

/* Secondary button (teal-accent on hover) */
bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium
hover:border-[#4FD1C5] transition-colors
```
