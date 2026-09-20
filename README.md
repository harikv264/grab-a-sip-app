# Grab A Sip — Mobile app (Expo)

One **role-aware** React Native app (Expo) for **customers** and **riders**.
On login it reads the user's role from the API and shows the right experience:

- **Customer:** subscriptions, deliveries, monthly summary.
- **Rider:** today's route, update delivery status, personal totals.

Same backend as the web (`grab-a-sip-api`), authenticated with the user's
Supabase JWT. Admins use the web dashboard, not this app.

## Run it (dev)
1. `npm install`
2. Copy env: `cp .env.example .env` and fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Settings → API)
   - `EXPO_PUBLIC_API_BASE_URL` = your Render backend URL
3. `npx expo start` → scan the QR code with **Expo Go** (iOS/Android) — the app runs on your phone instantly, no build needed.

## Login
- **Now (interim):** phone + temporary password created by admin ("Invite login" in the web admin).
- **Later:** phone OTP once MSG91 is activated in Supabase — no app change needed.

## Structure
- `App.tsx` — auth state + role routing (login → customer / rider / no-access)
- `src/supabase.ts` — Supabase client (AsyncStorage session persistence)
- `src/api.ts` — backend fetch forwarding the user's JWT
- `src/screens/*` — Login, Customer, Rider, NoAccess

## Publishing (later, your accounts)
Build with EAS (`npx eas build`) and submit to the App Store / Play Store —
needs your Apple ($99/yr) and Google ($25) developer accounts.
