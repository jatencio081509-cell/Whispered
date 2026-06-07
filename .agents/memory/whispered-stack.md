---
name: Whispered App Stack
description: Key architecture decisions and quirks for the Whispered couples app (Expo + Express + Drizzle + Clerk)
---

## Metro blockList fix
`exclusionList` from `metro-config` is NOT available in this Expo/Metro version. Use a raw RegExp instead:
```js
config.resolver.blockList = /node_modules[/\\]\.pnpm[/\\].*_tmp_\d+[/\\].*/;
```
**Why:** Solana-mobile pnpm patches leave stale `_tmp_\d+` dirs that crash Metro's file watcher with ENOENT.

## Clerk proxy — dev vs prod
`EXPO_PUBLIC_CLERK_PROXY_URL` must NOT be set in the dev script. The `clerkProxyMiddleware` is a no-op in `NODE_ENV !== 'production'`. Setting it in dev causes Clerk to try the dead proxy and block in the browser web preview (CORS).
**How to apply:** Only configure `proxyUrl` on `ClerkProvider` and only pass it in production builds.

## WebSocket path
WS server listens at path `/api/ws` (mounted on the HTTP server). Replit's proxy routes `/api/*` → api-server port. Client connects with `wss://${EXPO_PUBLIC_DOMAIN}/api/ws?token=<clerkToken>`.

## Auth patterns (Clerk Core v3 / Expo)
- After `signUp.create()`, the live SignUp instance **moves to `clerk.client.signUp`**. The `useSignUp()` hook's `signUp` ref becomes stale and loses methods like `prepareEmailAddressVerification` / `attemptEmailAddressVerification` (calling them throws "is not a function").
- **Correct pattern:** `signUp.create(...)` on the hook ref, then `clerk.client!.signUp.prepareEmailAddressVerification(...)` and `clerk.client!.signUp.attemptEmailAddressVerification({ code })` on the live client ref.
- On successful `attemptEmailAddressVerification`, get session from `result.createdSessionId ?? clerk.client?.lastActiveSession?.id`. If `result.status === "complete"` but `createdSessionId` is null, fall back to lastActiveSession before navigating.
- Sign-in uses `useSignIn()` — `signIn.create({ identifier, password })` then check `status === 'complete'`.
- **`setActive` is NOT returned by `useSignUp()` or `useSignIn()` in Clerk Expo v3** — always get it from `useClerk()`: `const { setActive } = useClerk()`. Destructuring from the other hooks returns `undefined` and causes a render crash.
- Auth guard: use `<Redirect href="...">` (declarative), NOT `router.replace()` in effects — avoids mount-time navigation errors.

## api-zod duplicate export fix
`lib/api-zod/src/index.ts` must only export from `./generated/api`, NOT `./generated/types`. The generated types file re-exports names that clash with the api file.

## Local data storage
Goals, journal, memories, prompts, and whispers are stored in AsyncStorage (device-local). Only messages and couple-linking are persisted in the backend DB.

## Colors
Always-dark palette: `background: #0B0A10`, `primary: #E8516C` (rose), `accent: #8B5CF6` (violet). Both `light` and `dark` theme keys in `constants/colors.ts` are identical.
