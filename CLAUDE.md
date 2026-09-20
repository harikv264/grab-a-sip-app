@AGENTS.md

# CLAUDE.md — grab-a-sip-app (mobile)

Repo facts for the **Grab A Sip** mobile app. The global `~/.claude/CLAUDE.md`
owns *how to think*; this file owns *this repo*. The `@AGENTS.md` line above is
imported first and is **mandatory**: Expo has changed — read the versioned docs
at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

- **`docs/DESIGN.md`** — the app's visual system (mirrors the web "Liquid Neon"
  theme in React Native). Read before UI work.
- **`docs/RULES.md`** — engineering rules for this repo. Read before coding.

---

## What this is

One **role-aware** Expo app for **customers and riders** (admins stay on the
web). After login it calls `/api/me`, reads the role, and renders the matching
screen. It talks to the same backend (`grab-a-sip-api`) and Supabase Auth as the
web app.

## Stack

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript ·
`@supabase/supabase-js` + `@react-native-async-storage/async-storage` +
`react-native-url-polyfill` (auth session storage) · `react-native-svg`
(JuiceGlass). **No navigation library** — screens are chosen by conditional
render in `App.tsx` (`session` + `role` → screen). Keep it that way unless a
real multi-stack need appears.

## Commands

```bash
npm install
npx expo start          # dev server; open in Expo Go (scan QR)
npx expo start --ios    # iOS simulator
npx expo start --android
npx tsc --noEmit        # typecheck — must pass before pushing
npx expo install <pkg>  # ALWAYS use this (not npm install) for native deps —
                        # it pins the SDK-57-compatible version
```

## Structure

```
App.tsx            auth state → LoginScreen / CustomerScreen / RiderScreen /
                   NoAccessScreen (role from /api/me)
src/
  supabase.ts      Supabase client (AsyncStorage session)
  api.ts           api/apiJson/toE164 — forwards the user JWT to the backend
  theme.ts         Liquid Neon palette + planColors() + MONTHLY_BOXES
  countries.ts     allowed phone countries (mirrors web; excludes some)
  screens/         LoginScreen, CustomerScreen, RiderScreen, NoAccessScreen
  components/      Header, JuiceGlass (RN), CountUp (RN)
app.json           Expo config (name, dark UI)
```

## Environment

- Env vars: see `.env.example`. Expo auto-loads `EXPO_PUBLIC_*` and **bundles
  them into the app** — only put public values there (anon key, public URLs).
  Never ship a service-role key or admin token.
- `EXPO_PUBLIC_SUPABASE_URL` is the bare project URL; `EXPO_PUBLIC_API_BASE_URL`
  points at the Render backend.

## Auth note

Interim login is **phone + temporary password** (admin-provisioned) until the
MSG91 SMS/OTP provider is activated. The app never creates accounts.
