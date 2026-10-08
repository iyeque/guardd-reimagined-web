# DigitalGuard Vercel Deployment Audit

**Assessment date:** 2026-10-08  
**Scope:** repository source/configuration, community hub topics/events, family commitments, admin dashboard sync, and current Vercel documentation.

## Executive diagnosis

The project is a **Vite SPA plus an Express/Postgres backend**, but `vercel.json` primarily configures it as a static Vite site. The affected features all call `/api/...`; therefore they depend on a correctly deployed Vercel Function, correct API routing, and production environment variables.

The most likely reason the community, commitments, and admin features fail after a Git/Vercel deployment is:

1. **The SPA catch-all rewrite is global** (`/(.*) -> /index.html`) and is not scoped away from `/api`.
2. **The only generated serverless entrypoint is `api/index.js`**, while the application exposes many nested paths such as `/api/community/data`, `/api/family/commitments`, and `/api/admin/messages`. There is no explicit Vercel catch-all function or `/api/*` rewrite to guarantee that every nested path reaches the Express handler.
3. **The backend imports `server/db.ts` at module load and throws immediately if `DATABASE_URL` is absent.** A missing Production variable makes the entire function fail before any route can respond.
4. **The build runs `npm run db:push`**, so a deployment can fail before producing the frontend/function artifacts if `DATABASE_URL` is missing, invalid, or the database is unreachable during the build.
5. **The configured Vercel Cron sends GET, but the sync endpoint only accepts POST.** The scheduled sync therefore cannot execute as configured.

## Evidence from the repository

| Finding | Evidence | Impact |
|---|---|---|
| Static SPA fallback is global | `vercel.json`: `source: "/(.*)"`, `destination: "/index.html"` | A failed/unmatched API request can return HTML. The frontend then reports JSON/content-type errors rather than the real backend error. |
| Backend is generated during build | `package.json` build script runs Vite, bundles `server/start.ts`, then creates `api/index.js` from `server/api/index.ts` | GitHub contains source; it does not itself run Express. Vercel must run this exact build successfully. |
| API entrypoint is a single `api/index.js` | `server/api/index.ts` imports the Express app and exports one handler | Nested `/api/...` paths need explicit catch-all routing/function mapping to reliably reach this handler. |
| API module hard-fails without DB config | `server/db.ts:26-30` throws when `DATABASE_URL` is missing | Every API route can fail at cold start, including health, community, commitments, and admin. |
| Database mutation happens during build | `package.json` begins build with `npm run db:push` | Production build depends on live database connectivity and performs schema changes on every deployment. |
| Cron method mismatch | `vercel.json` schedules `/api/community/sync`; `server/routes.ts:179` only registers `app.post(...)` | Vercel Cron invokes the path with GET, so the scheduled sync does not hit the POST route. |
| Server startup behavior is not used by the function | `server/start.ts` starts an HTTP listener and a `setInterval`; `server/api/index.ts` imports only `app` | The Vercel function does not run the initial sync or periodic interval. Fire-and-forget sync from a request is not reliable in a serverless lifecycle. |
| Family detail API is defined but not used by the UI | `FamilyCommitments.tsx` defines `api.get`, but card clicks set `milestones: []` directly | Existing milestones never load when opening a commitment. The page can look unsynchronized even when the API/database is working. |
| Refresh button does not refresh | `FamilyCommitments.tsx:426-431` button only calls `setSelected(null)` | It changes the view but does not call `load()`. |
| Admin curated endpoints are not protected | `server/routes.ts:507-552` registers curated GET/POST/PATCH/DELETE without `validateAdmin` | Anyone who discovers the endpoint can create, edit, or delete community content. This is a security defect separate from the deployment failure. |
| Admin key is placed in query strings | `Admin.tsx` appends `?key=${adminKey}` to every request | Keys can appear in browser history, analytics, proxy logs, and Vercel request logs. Use an `x-admin-key` header and a safer authenticated session/token design. |

## Why each affected feature breaks

### Community hub topics/events

`CommunitySupport.tsx` calls:

- `GET /api/community/data`
- `GET /api/admin/curated-content`

If the API path is rewritten to `index.html`, the component rejects the non-JSON response. If the function starts but `DATABASE_URL` is absent, `server/db.ts` throws before the route runs. If the DB is empty, the route attempts a background sync after returning; Vercel may suspend the invocation immediately after the response, so the sync is not guaranteed to finish.

The scheduled sync also cannot work because Vercel Cron makes a GET request while the route only accepts POST.

### Family commitments

The UI calls:

- `GET /api/family/commitments?familyId=...`
- `POST /api/family/commitments`
- `POST /api/family/commitments/:id/complete`
- `POST /api/family/commitments/:id/milestones`

These are valid Express routes, but they are unavailable if the function is not reached or the DB module fails at import. Creation additionally performs encryption and then ledger/IPFS work before returning. `PINATA_JWT` is optional and falls back locally, but a slow/unreachable Pinata request can make creation appear stuck because no timeout is configured.

There is also a client bug independent of Vercel: `api.get()` is never called when a commitment card is opened, so milestones are not synchronized into the detail view.

### Admin page

The page depends on `ADMIN_SECRET` being set in the **Production** Vercel environment. If absent, `validateAdmin` returns HTTP 500. If the API is rewritten to HTML, the page attempts to parse HTML as JSON. The manual sync button uses POST and can work only if the function routing, `DATABASE_URL`, `ADMIN_SECRET`, and external sync configuration are all correct.

## Recommended remediation order

### P0 — Make API routing deterministic

Choose one architecture and apply it consistently:

**Option A: Keep Express on Vercel Functions (smallest migration).**

- Build one catch-all Vercel function for `/api/*`, rather than relying on `api/index.js` to match nested paths implicitly.
- Add an explicit `/api/:path*` rewrite to that catch-all function if required by the chosen function layout.
- Put the SPA fallback after API routing and scope it to non-API paths, for example with a negative lookahead pattern such as `/:path((?!api/).*)` where supported.
- Verify these URLs on a Preview deployment and confirm `Content-Type: application/json`:
  - `/api/health`
  - `/api/community/data`
  - `/api/family/commitments?familyId=default-family`
  - `/api/admin/messages?key=...` (temporarily, while migrating auth)

**Option B: Move to a Vite-compatible full-stack framework/plugin.**

Vercel’s current Vite guidance recommends a framework’s native function model or Nitro for full-stack Vite applications. This avoids hand-generating an Express artifact and reduces routing ambiguity.

### P0 — Configure Vercel Production variables

Set these in **Project Settings → Environment Variables → Production**, then redeploy. Vercel states that variable changes apply only to new deployments.

Required for the affected features:

- `DATABASE_URL`
- `ADMIN_SECRET`
- `ENCRYPTION_KEY` (64-character hex string; without it, commitments silently fall back to plaintext)

Community sync integrations:

- `SERP_API_KEY` (optional; events fall back if absent)
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT` (optional)
- `COMM_RSS_FEEDS` (optional)
- `COMM_SYNC_INTERVAL_MINUTES` is irrelevant to a Vercel function interval; use Cron instead.

Other features:

- `PINATA_JWT` (optional; IPFS pinning)
- `VITE_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`
- `OPENROUTER_API_KEY`, `OPENROUTER_ENDPOINT`, `OPENROUTER_MODEL`

Do not commit `.env`; it is correctly ignored. Use `.env.example` as the checklist.

### P0 — Fix the Cron endpoint

Add a GET route that is explicitly intended for Vercel Cron, or create a dedicated `/api/cron/community-sync` handler that calls `syncCommunityData()` and returns JSON. Do not depend on the long-running `setInterval` in `server/start.ts`.

Also update the cron authentication logic to use the current Vercel Cron headers documented by Vercel, or protect the endpoint with a separate cron secret. Do not assume the undocumented/old `x-vercel-cron: true` header is always present.

### P1 — Remove schema mutation from the build

Change the deployment build to compile/build only. Run Drizzle migrations or schema push as a deliberate deployment step, not automatically on every Vercel build. At minimum:

- remove `npm run db:push` from `build`;
- run migrations against the intended production database separately;
- keep `DATABASE_URL` available at runtime;
- ensure Preview and Production do not accidentally share a destructive database target.

### P1 — Make serverless sync reliable

Do not rely on fire-and-forget work after `res.json()`. Use a Cron function for scheduled synchronization, or use Vercel’s `waitUntil` where background completion is required. Add request timeouts to SerpApi, RSS, Reddit, and Pinata calls so one upstream service cannot consume the entire function duration.

### P1 — Fix family commitment detail loading

When a card is selected, call `api.get(it.id)` and populate both the commitment and returned milestones. Change the Refresh button to call `load()` rather than only clearing the selected item.

### P1 — Protect curated content routes

Apply `validateAdmin` to curated content write/update/delete routes, and preferably to the admin listing route as well. Replace query-string admin keys with an `x-admin-key` header as an interim improvement; a real authenticated admin session is preferable.

## Validation performed

- **TypeScript:** `npm run check` passed with exit code 0.
- **Client build:** `npm run build:dev` could not complete on this Windows execution device because the local esbuild process reported `Access is denied` while resolving the Vite config directory. This is an execution-device permission issue, not a TypeScript error; validate the build in a clean local shell/CI/Vercel Preview.
- **Repository scan:** reviewed build scripts, Vercel config, server entrypoints, database/storage, community sync, family commitments, admin dashboard, schema, and client API calls.

## Vercel documentation used

- [Vercel Functions](https://vercel.com/docs/functions) — request-driven function lifecycle and serverless execution.
- [Functions API Reference](https://vercel.com/docs/functions/functions-api-reference) — function placement and handler conventions.
- [Vercel Rewrites](https://vercel.com/docs/rewrites) — wildcard rewrites and routing behavior.
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — SPA fallback and Vite function/full-stack guidance.
- [Environment Variables](https://vercel.com/docs/environment-variables) — Production/Preview/Development scopes and redeploy requirement.
- [Cron Jobs](https://vercel.com/docs/cron-jobs) — Vercel Cron uses HTTP GET and UTC schedules.
- [Connection Pooling with Vercel Functions](https://vercel.com/kb/guide/connection-pooling-with-functions) — database connection lifecycle guidance for serverless functions.

## Bottom line

This is not primarily a React problem. The deployment is mixing a static Vite output, a generated Express function, a global SPA rewrite, build-time database mutation, and a POST-only sync route behind a GET-based Cron. Fix API routing and Production environment variables first; then fix Cron and the client-side commitment detail loading. Those changes address the common failure mode where the UI is deployed successfully but every affected API call returns HTML, a function startup error, or a 500 response.
