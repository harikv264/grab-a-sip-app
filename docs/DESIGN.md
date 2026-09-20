# DESIGN.md — grab-a-sip-app (mobile) design system

The app mirrors the web **"Liquid Neon"** brand in React Native: deep near-black
canvas, neon fruit accents, rounded glassy cards, liquid motion. It should feel
like the same product as the website. Read before UI work; reuse before adding.

---

## 1. Colour (`src/theme.ts`)

Single source of truth — always import `theme`, never inline hex.

| Token   | Hex       | Use                                |
|---------|-----------|------------------------------------|
| ink     | `#0B0A12` | screen background                  |
| surface | `#14121E` | card background                    |
| surface2| `#1C1930` | raised card                        |
| border  | rgba white 12% | hairline borders             |
| text    | `#ECEAF6` | primary text                       |
| muted   | `#A6A2BD` | secondary text                     |
| dim     | `#726E88` | tertiary / captions                |
| lime    | `#C6FF4F` | primary accent / active            |
| mango   | `#FFC542` | warm / paused                      |
| berry   | `#FF3E9A` | hot / error                        |
| aqua    | `#38F5C9` | cool / info                        |
| grape   | `#A855F7` | secondary accent                   |
| orange  | `#FF6B2C` | garnish                            |

Semantic mapping matches web: active=lime, paused=mango, failed/error=berry,
info=aqua. Plans get their colour from `planColors(name)` — reuse it.

## 2. Shape & layout

- Cards: `backgroundColor: theme.surface`, `borderRadius: 18–24`, 1px
  `theme.border`. Screens use ~20px padding, dark `theme.ink` background.
- Stat tiles, badges (pill), section headings (`h2`, weight 800). Keep the
  patterns already in `CustomerScreen`/`RiderScreen` consistent.
- Dark theme only (`userInterfaceStyle: "dark"` in `app.json`).

## 3. Motion

- Use the RN `Animated` API (as `JuiceGlass` and `CountUp` do). Ease-out,
  physical settles — no linear/mechanical timing.
- Prefer `useNativeDriver: true` for transform/opacity; SVG-attribute animation
  uses `false` (that's expected — see `JuiceGlass`).
- Keep animation subtle and purposeful; the phone is small — don't overwhelm.

## 4. Signature components (`src/components/`)

- **`JuiceGlass`** — the brand's subscription-progress motif (RN twin of the web
  glass; `react-native-svg` + `Animated`). Use for progress meaning (month
  filled, route completed), not decoration.
- **`CountUp`** — numbers count up on mount; use for stat tiles.
- **`Header`** — shared screen header.

When you need a new reusable visual, add it here as a small component rather than
inlining, and keep it consistent with the web equivalent where one exists.

## 5. Accessibility

- Respect large text where feasible; keep contrast against `ink`.
- Decorative SVG is `aria-hidden`-equivalent (no accessibility role); actionable
  controls get clear labels. Touch targets ≥ 44px.
