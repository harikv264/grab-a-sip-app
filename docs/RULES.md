# RULES.md — grab-a-sip-app (mobile) engineering rules

Repo-specific rules under the global `~/.claude/CLAUDE.md`
(correctness > simplicity > maintainability > security > …).

## Expo / native (read first)

- **Expo SDK 57.** Before touching anything native or config, check
  https://docs.expo.dev/versions/v57.0.0/ (per `AGENTS.md`). APIs move between
  SDKs — don't rely on memory of older Expo.
- Add native modules with **`npx expo install <pkg>`**, never a bare
  `npm install`, so the SDK-compatible version is pinned.
- Keep the **no-router** architecture (conditional render in `App.tsx`) unless a
  genuine multi-stack need appears. Don't add React Navigation speculatively.

## Architecture

- Screens in `src/screens`, reusable UI in `src/components`, shared logic in the
  top-level `src/*.ts` (`api`, `supabase`, `theme`, `countries`).
- The backend is the source of truth; the app renders what `/api/*` returns and
  forwards the user JWT via `src/api.ts`. Don't duplicate backend logic.
- Role decides the screen (`/api/me`). A customer must never reach rider data or
  vice-versa — the backend scopes it, and the app must not try to widen it.

## Security

- Only `EXPO_PUBLIC_*` values ship in the bundle, and they are **public** by
  definition — never put a service-role key or admin token there.
- The app never creates accounts (admin-provisioned only).
- Phone country allow-list (`src/countries.ts`) mirrors web and **excludes**
  Pakistan, Bangladesh, Sri Lanka, China, Israel. Don't add them.

## UI

- Follow `docs/DESIGN.md`: import `theme` (no inline hex), reuse `JuiceGlass`,
  `CountUp`, `Header`. Keep parity with the web brand.
- Animate with `Animated`; keep it subtle and respect small screens.

## Quality & DoD

```
✓ npx tsc --noEmit passes
✓ native deps added via `npx expo install`
✓ no service-role/admin secrets in EXPO_PUBLIC_* or the bundle
✓ role scoping respected; country allow-list intact
✓ .env.example updated if envs changed
✓ diff is surgical — no unrelated churn
```

TypeScript: no `any` in shared signatures; type API payloads. Match surrounding
style. Run on a simulator/Expo Go when a change is visual before claiming done.
