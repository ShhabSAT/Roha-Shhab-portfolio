# DESIGN CONSTITUTION — ROHA SHHAB PORTFOLIO
You MUST strictly follow these design rules on every single component and file. Never deviate.

## 1. Aesthetic Direction: Modern Editorial Baroque (Awwwards Level)
- Vibe: High-fashion cinema, luxury publishing house, theatrical storytelling. Dark, moody, tactile, quiet luxury.
- Painterly canvas texture inspired by fine classical oil painting. Rich crimson velvet contrasting against antique parchment.
- STRICTLY FORBIDDEN (Anti-AI-Slop Rules):
  - NO generic SaaS gradients, NO neon glows, NO purple/blue tints, NO bright yellow gold (#FFD700).
  - NO glassmorphism (`backdrop-blur` translucent white cards).
  - NO big rounded corners (`rounded-xl`, `rounded-2xl`, `rounded-3xl`). Use sharp architectural corners (`0px` or max `2px`).
  - NO emojis as UI icons. Use thin-stroke `lucide-react` icons (`strokeWidth={1.25}`) or exact provided SVGs.
  - NO improvised complex floral SVGs. Only use minimal geometric hairlines or explicitly provided SVG paths.
  - NO generic bounce animations. Use refined, slow, weighted easing (`power3.out`, `expo.out`).

## 2. Upgraded Color Palette (Painterly Crimson & Parchment)
- `--crimson-shadow`: `#1B0405` (deep vignette corners)
- `--crimson-velvet`: `#3E090B` (primary rich crimson base — visibly red-burgundy, NOT black!)
- `--crimson-glow`: `#611211` (warm museum spotlight highlight in gradients)
- `--parchment-light`: `#EFE5D1` (antique ivory/beige surface for breaking contrast)
- `--parchment-warm`: `#E2D3B7` (secondary parchment border/surface)
- `--ink-dark`: `#1E0707` (primary dark crimson-ink text on parchment sections)
- `--terracotta`: `#9E4224` (warm burnt sienna accent)
- `--gold-antique`: `#C8A86B` (muted champagne antique gold)
- `--border-hairline`: `rgba(200, 168, 107, 0.20)` (1px dividers)

## 3. Typography System
- Display / Headings: `'Cormorant Garamond', serif` (Use mix of weight 300/400 and *italic* words for editorial contrast. Tight tracking `-0.03em` on large display text).
- Body / UI / Micro-labels: `'Plus Jakarta Sans', sans-serif` (Weight 300/400 for body; uppercase with `tracking-[0.22em]` and `text-[11px]` for micro-labels like `01 / SELECTED WORKS`).
- No Arabic typography (client request): the wordmark is English-only, set in `'Cormorant Garamond'`.

## 4. Technical Rules
- Stack: React (Vite) + TypeScript + Tailwind CSS + GSAP (`ScrollTrigger`) + `lenis` + `lucide-react`.
- Always clean up GSAP animations using `gsap.context()` inside `useEffect` so React StrictMode never breaks scroll triggers.
- Every section must be responsive (desktop-first luxury layout, clean editorial stack on mobile).
